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

describe("Read-only expanded endpoints", () => {
  test("getRoles returns array with id and name", async () => {
    const roles = await client.getRoles();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.length).toBeGreaterThan(0);

    for (const r of roles) {
      expect(typeof r.id).toBe("number");
      expect(r.id).toBeGreaterThan(0);
      expect(typeof r.name).toBe("string");
      expect(r.name.length).toBeGreaterThan(0);
    }
  });

  test("getRole fetches first role by id and verifies name", async () => {
    const roles = await client.getRoles();
    if (roles.length === 0) {
      console.warn("[e2e] No roles found, skipping getRole test");
      return;
    }

    const firstRole = roles[0];
    const fetched = await client.getRole(firstRole.id);
    expect(fetched.id).toBe(firstRole.id);
    expect(typeof fetched.name).toBe("string");
    expect(fetched.name.length).toBeGreaterThan(0);
  });

  test("getConfiguration returns object", async () => {
    const config = await client.getConfiguration();
    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });

  test("getServerInfo returns object", async () => {
    const info = await client.getServerInfo();
    expect(info).toBeDefined();
    expect(typeof info).toBe("object");
  });

  test("listPrincipals returns array with id and name", async () => {
    try {
      // List without projectId filter — the project filter is not supported by all instances
      const principals = await client.listPrincipals();
      expect(Array.isArray(principals)).toBe(true);

      for (const p of principals) {
        expect(typeof p.id).toBe("number");
        expect(p.id).toBeGreaterThan(0);
        expect(typeof p.name).toBe("string");
      }
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] listPrincipals: 403 Forbidden, skipping");
        return;
      }
      throw err;
    }
  });

  test("listWeekDays returns array of 7 days", async () => {
    const weekDays = await client.listWeekDays();
    expect(Array.isArray(weekDays)).toBe(true);
    expect(weekDays.length).toBe(7);

    for (const d of weekDays) {
      expect(typeof d.day).toBe("number");
    }
  });

  test("listNonWorkingDays returns array", async () => {
    const nonWorkingDays = await client.listNonWorkingDays();
    expect(Array.isArray(nonWorkingDays)).toBe(true);
    // May be empty, just verify it's an array
  });

  test("getWorkPackageSchema returns object", async () => {
    // Call without projectId — project-scoped schema endpoint may not exist on all instances
    try {
      const schema = await client.getWorkPackageSchema();
      expect(schema).toBeDefined();
      expect(typeof schema).toBe("object");
    } catch (err: any) {
      if (err?.message?.includes("404") || err?.statusCode === 404) {
        console.warn("[e2e] getWorkPackageSchema: 404, skipping");
        return;
      }
      throw err;
    }
  });

  test("getProjectSchema returns object", async () => {
    const schema = await client.getProjectSchema();
    expect(schema).toBeDefined();
    expect(typeof schema).toBe("object");
  });

  test("listQueries returns array", async () => {
    try {
      const queries = await client.listQueries({ projectId: project.id });
      expect(Array.isArray(queries)).toBe(true);

      for (const q of queries) {
        expect(typeof q.id).toBe("number");
        expect(q.id).toBeGreaterThan(0);
      }
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] listQueries: 403 Forbidden, skipping");
        return;
      }
      throw err;
    }
  });

  test("listDocuments returns array", async () => {
    try {
      const documents = await client.listDocuments({ projectId: project.id });
      expect(Array.isArray(documents)).toBe(true);

      for (const d of documents) {
        expect(typeof d.id).toBe("number");
        expect(d.id).toBeGreaterThan(0);
      }
    } catch (err: any) {
      if (
        err?.status === 403 || err?.message?.includes("403") ||
        err?.statusCode === 404 || err?.message?.includes("404")
      ) {
        console.warn("[e2e] listDocuments: not available on this project, skipping");
        return;
      }
      throw err;
    }
  });
});
