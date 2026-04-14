import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { linkTitle } from "../../src/helpers.js";
import { buildWeeklySummary } from "../../src/tools/knowledge.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage } from "../../src/types.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();
const ts = Date.now();

let wpA: WorkPackage;
let wpB: WorkPackage;
let wpC: WorkPackage;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

afterAll(async () => {
  await tracker.cleanup(client);
});

describe("Agile/Kanban workflow", () => {
  test("creates three work packages as backlog items", async () => {
    wpA = await client.createWorkPackage(project, `[E2E-WF] Agile-A ${ts}`, "Task", "Agile WP A");
    wpB = await client.createWorkPackage(project, `[E2E-WF] Agile-B ${ts}`, "Task", "Agile WP B");
    wpC = await client.createWorkPackage(project, `[E2E-WF] Agile-C ${ts}`, "Task", "Agile WP C");
    tracker.trackWorkPackage(wpA.id);
    tracker.trackWorkPackage(wpB.id);
    tracker.trackWorkPackage(wpC.id);

    expect(wpA.id).toBeGreaterThan(0);
    expect(wpB.id).toBeGreaterThan(0);
    expect(wpC.id).toBeGreaterThan(0);
    expect(linkTitle(wpA, "status", "")).toBe("New");
  });

  test("moves WP A to 'In progress' status", async () => {
    const updated = await client.updateWorkPackageStatus(wpA.id, "In progress");
    expect(linkTitle(updated, "status", "")).toBe("In progress");
  });

  test("creates 'blocks' relation: C blocks A", async () => {
    const relation = await client.createRelation(wpC.id, wpA.id, "blocks", "C is blocking A");
    expect(relation.type).toBe("blocks");
    const fromHref = (relation._links as Record<string, any>)?.from?.href;
    const toHref = (relation._links as Record<string, any>)?.to?.href;
    expect(fromHref).toContain(`/work_packages/${wpC.id}`);
    expect(toHref).toContain(`/work_packages/${wpA.id}`);
  });

  test("adds comment on A explaining the blocker", async () => {
    const result = await client.addComment(wpA.id, `Blocked by #${wpC.id}: ${ts}`);
    expect(result).toBeDefined();
  });

  test("lists project WPs (before closing) and verifies all three appear", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 500 });
    const ids = wps.map((w) => w.id);
    expect(ids).toContain(wpA.id);
    expect(ids).toContain(wpB.id);
    expect(ids).toContain(wpC.id);
  });

  test("closes WP B", async () => {
    let closed: WorkPackage;
    try {
      closed = await client.updateWorkPackageStatus(wpB.id, "Closed");
    } catch {
      closed = await client.updateWorkPackageStatus(wpB.id, "Rejected");
    }
    const status = linkTitle(closed, "status", "");
    expect(["Closed", "Rejected"]).toContain(status);
  });

  test("generates weekly_summary for the project", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 100 });
    const summary = buildWeeklySummary(project, wps);
    expect(summary).toContain("# Weekly Status");
    expect(summary).toContain(project.name);
    expect(summary).toContain("## Wins / completed");
    expect(summary).toContain("## In progress");
  });
});
