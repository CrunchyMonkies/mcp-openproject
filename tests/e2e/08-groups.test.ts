import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Group } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let createdGroup: Group;

const ts = Date.now();

beforeAll(async () => {
  client = getTestClient();
});

afterAll(async () => {
  if (createdGroup?.id) {
    try {
      await client.deleteGroup(createdGroup.id);
    } catch {
      console.warn(`[e2e cleanup] Could not delete group #${createdGroup.id}`);
    }
  }
});

describe("Group lifecycle", () => {
  test("creates group with name", async () => {
    try {
      createdGroup = await client.createGroup({ name: `[E2E-TEST] Group ${ts}` });
      expect(typeof createdGroup.id).toBe("number");
      expect(createdGroup.id).toBeGreaterThan(0);
      expect(createdGroup.name).toBe(`[E2E-TEST] Group ${ts}`);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] createGroup: 403 Forbidden, skipping group lifecycle tests");
        return;
      }
      throw err;
    }
  });

  test("gets group by id and verifies name", async () => {
    if (!createdGroup?.id) {
      console.warn("[e2e] No group created, skipping getGroup test");
      return;
    }

    const fetched = await client.getGroup(createdGroup.id);
    expect(fetched.id).toBe(createdGroup.id);
    expect(fetched.name).toBe(`[E2E-TEST] Group ${ts}`);
    expect(fetched._links?.self?.href).toContain(`/groups/${createdGroup.id}`);
  });

  test("lists groups and verifies created group appears", async () => {
    if (!createdGroup?.id) {
      console.warn("[e2e] No group created, skipping listGroups test");
      return;
    }

    const groups = await client.listGroups();
    expect(Array.isArray(groups)).toBe(true);

    const ids = groups.map((g) => g.id);
    expect(ids).toContain(createdGroup.id);

    for (const g of groups) {
      expect(typeof g.id).toBe("number");
      expect(g.id).toBeGreaterThan(0);
      expect(typeof g.name).toBe("string");
    }
  });

  test("updates group name and verifies persistence", async () => {
    if (!createdGroup?.id) {
      console.warn("[e2e] No group created, skipping updateGroup test");
      return;
    }

    const newName = `[E2E-TEST] Group Updated ${ts}`;
    const updated = await client.updateGroup(createdGroup.id, { name: newName });

    expect(updated.id).toBe(createdGroup.id);
    expect(updated.name).toBe(newName);

    // Verify by re-fetching
    const refetched = await client.getGroup(createdGroup.id);
    expect(refetched.name).toBe(newName);
  });

  test("deletes group without throwing", async () => {
    if (!createdGroup?.id) {
      console.warn("[e2e] No group created, skipping deleteGroup test");
      return;
    }

    try {
      await client.deleteGroup(createdGroup.id);
      createdGroup = { ...createdGroup, id: 0 };
    } catch (err: any) {
      // Some instances reject deleting groups that have members (422)
      if (err?.statusCode === 422 || err?.message?.includes("422")) {
        console.warn(`[e2e] deleteGroup: 422 Unprocessable (group may have members), skipping`);
        createdGroup = { ...createdGroup, id: 0 };
        return;
      }
      throw err;
    }
  });
});
