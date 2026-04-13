import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, Version } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
let createdVersion: Version | undefined;
let moduleAvailable = false;

const ts = Date.now();

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();

  // Probe whether the versions module is enabled on this project
  try {
    const probe = await client.createVersion({
      name: `[E2E-PROBE] ${ts}`,
      projectId: project.id,
    });
    moduleAvailable = true;
    createdVersion = probe;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 403) {
      moduleAvailable = false;
      console.warn("[e2e] Versions module not enabled on test project — skipping version tests");
    } else {
      throw err;
    }
  }
});

afterAll(async () => {
  if (createdVersion?.id) {
    try {
      await client.deleteVersion(createdVersion.id);
    } catch {
      console.warn(`[e2e cleanup] Could not delete version #${createdVersion.id}`);
    }
  }
});

describe("Version lifecycle", () => {
  test("creates version with name and projectId", () => {
    if (!moduleAvailable) return;
    expect(createdVersion).toBeDefined();
    expect(typeof createdVersion!.id).toBe("number");
    expect(createdVersion!.id).toBeGreaterThan(0);
    expect(createdVersion!.name).toBe(`[E2E-PROBE] ${ts}`);
  });

  test("gets version by id and verifies name", async () => {
    if (!moduleAvailable || !createdVersion?.id) return;

    const fetched = await client.getVersion(createdVersion.id);
    expect(fetched.id).toBe(createdVersion.id);
    expect(fetched.name).toBe(createdVersion.name);
    expect(fetched._links?.self?.href).toContain(`/versions/${createdVersion.id}`);
  });

  test("lists versions for project and verifies created version appears", async () => {
    if (!moduleAvailable || !createdVersion?.id) return;

    const versions = await client.listVersions(project.id);
    expect(Array.isArray(versions)).toBe(true);
    const ids = versions.map((v) => v.id);
    expect(ids).toContain(createdVersion.id);

    for (const v of versions) {
      expect(typeof v.id).toBe("number");
      expect(v.id).toBeGreaterThan(0);
      expect(typeof v.name).toBe("string");
    }
  });

  test("updates version name and verifies persistence", async () => {
    if (!moduleAvailable || !createdVersion?.id) return;

    const newName = `[E2E-TEST] v1.0 Updated ${ts}`;
    const updated = await client.updateVersion(createdVersion.id, { name: newName });

    expect(updated.id).toBe(createdVersion.id);
    expect(updated.name).toBe(newName);

    const refetched = await client.getVersion(createdVersion.id);
    expect(refetched.name).toBe(newName);
  });

  test("deletes version without throwing", async () => {
    if (!moduleAvailable || !createdVersion?.id) return;

    await expect(client.deleteVersion(createdVersion.id)).resolves.not.toThrow();
    createdVersion = undefined;
  });
});
