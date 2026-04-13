import { describe, test, expect, beforeAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

describe("Memberships (read-only)", () => {
  test("lists memberships and returns array", async () => {
    try {
      const memberships = await client.listMemberships({ projectId: project.id });
      expect(Array.isArray(memberships)).toBe(true);

      for (const m of memberships) {
        expect(typeof m.id).toBe("number");
        expect(m.id).toBeGreaterThan(0);
      }
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] listMemberships: 403 Forbidden, skipping");
        return;
      }
      throw err;
    }
  });

  test("gets first membership by id if memberships exist", async () => {
    let memberships;
    try {
      memberships = await client.listMemberships({ projectId: project.id });
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] listMemberships: 403 Forbidden, skipping getMembership test");
        return;
      }
      throw err;
    }

    if (memberships.length === 0) {
      console.warn("[e2e] No memberships found, skipping getMembership test");
      return;
    }

    const firstId = memberships[0].id;
    try {
      const membership = await client.getMembership(firstId);
      expect(typeof membership.id).toBe("number");
      expect(membership.id).toBe(firstId);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] getMembership: 403 Forbidden, skipping");
        return;
      }
      throw err;
    }
  });
});
