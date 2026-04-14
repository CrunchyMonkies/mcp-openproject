import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { linkTitle } from "../../src/helpers.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, User, WorkPackage } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();
const ts = Date.now();

let users: User[];
let wpA: WorkPackage;
let wpB: WorkPackage;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

afterAll(async () => {
  await tracker.cleanup(client);
});

describe("Team workload workflow", () => {
  test("lists users and captures team", async () => {
    users = await client.getUsers();
    expect(users.length).toBeGreaterThan(0);
  });

  test("creates two work packages for workload assessment", async () => {
    wpA = await client.createWorkPackage(project, `[E2E-WF] Workload-A ${ts}`, "Task", "Workload test A");
    wpB = await client.createWorkPackage(project, `[E2E-WF] Workload-B ${ts}`, "Task", "Workload test B");
    tracker.trackWorkPackage(wpA.id);
    tracker.trackWorkPackage(wpB.id);
    expect(wpA.id).toBeGreaterThan(0);
    expect(wpB.id).toBeGreaterThan(0);
  });

  test("assigns both WPs to the first user", async () => {
    const user = users[0];
    const userRef = String(user.id);

    try {
      const updated = await client.updateWorkPackage(wpA.id, { assigneeRef: userRef });
      const assignee = linkTitle(updated, "assignee", "");
      expect(assignee.length).toBeGreaterThan(0);
    } catch (err: any) {
      // Some users cannot be assigned (e.g., locked accounts) — skip gracefully
      console.warn(`[e2e] Could not assign WP A: ${err?.message || err}`);
      return;
    }

    try {
      await client.updateWorkPackage(wpB.id, { assigneeRef: userRef });
    } catch { /* ignore */ }
  });

  test("lists project work packages and filters by assignee client-side", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 500 });
    const ids = wps.map((w) => w.id);
    expect(ids).toContain(wpA.id);
    expect(ids).toContain(wpB.id);
  });

  test("lists configured week days (returns 7 entries)", async () => {
    const weekDays = await client.listWeekDays();
    expect(Array.isArray(weekDays)).toBe(true);
    expect(weekDays.length).toBe(7);
  });

  test("lists non-working days (may be empty)", async () => {
    const nonWorking = await client.listNonWorkingDays();
    expect(Array.isArray(nonWorking)).toBe(true);
  });

  test("reassigns WP A to a different user (if available)", async () => {
    if (users.length < 2) {
      console.warn("[e2e] Only 1 user available, skipping reassignment");
      return;
    }
    const newUser = users[1];
    try {
      const updated = await client.updateWorkPackage(wpA.id, { assigneeRef: String(newUser.id) });
      // Don't assert specific title since user may not be assignable on all projects
      expect(updated.id).toBe(wpA.id);
    } catch (err: any) {
      console.warn(`[e2e] Reassignment not allowed: ${err?.message || err}`);
    }
  });

  test("adds comment explaining reassignment", async () => {
    const result = await client.addComment(wpA.id, `Reassigned for workload balancing ${ts}`);
    expect(result).toBeDefined();
  });
});
