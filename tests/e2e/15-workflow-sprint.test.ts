import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { linkTitle } from "../../src/helpers.js";
import { buildWeeklySummary } from "../../src/tools/knowledge.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage, Version } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();
const ts = Date.now();

let sprintVersion: Version | undefined;
let versionModuleAvailable = false;
let storyA: WorkPackage;
let storyB: WorkPackage;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();

  // Probe versions module
  try {
    const probe = await client.createVersion({
      name: `[E2E-WF] Sprint ${ts}`,
      projectId: project.id,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    versionModuleAvailable = true;
    sprintVersion = probe;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 403) {
      versionModuleAvailable = false;
      console.warn("[e2e] Versions module not enabled, sprint version tests will skip");
    } else {
      throw err;
    }
  }
});

afterAll(async () => {
  if (sprintVersion?.id) {
    try { await client.deleteVersion(sprintVersion.id); } catch { /* ignore */ }
  }
  await tracker.cleanup(client);
});

describe("Sprint planning workflow", () => {
  test("creates sprint version with start/end dates", () => {
    if (!versionModuleAvailable) return;
    expect(sprintVersion).toBeDefined();
    expect(sprintVersion!.id).toBeGreaterThan(0);
    expect(sprintVersion!.name).toContain("[E2E-WF] Sprint");
  });

  test("creates backlog story WPs", async () => {
    storyA = await client.createWorkPackage(project, `[E2E-WF] Story-A ${ts}`, "Task", "Backlog story A");
    storyB = await client.createWorkPackage(project, `[E2E-WF] Story-B ${ts}`, "Task", "Backlog story B");
    tracker.trackWorkPackage(storyA.id);
    tracker.trackWorkPackage(storyB.id);
    expect(storyA.id).toBeGreaterThan(0);
    expect(storyB.id).toBeGreaterThan(0);
  });

  test("moves story A through status flow: New -> In progress -> Closed", async () => {
    const inProgress = await client.updateWorkPackageStatus(storyA.id, "In progress");
    expect(linkTitle(inProgress, "status", "")).toBe("In progress");

    let closed: WorkPackage;
    try {
      closed = await client.updateWorkPackageStatus(storyA.id, "Closed");
    } catch {
      closed = await client.updateWorkPackageStatus(storyA.id, "Rejected");
    }
    expect(["Closed", "Rejected"]).toContain(linkTitle(closed, "status", ""));
  });

  test("lists sprint version details", async () => {
    if (!versionModuleAvailable || !sprintVersion?.id) return;
    const fetched = await client.getVersion(sprintVersion.id);
    expect(fetched.id).toBe(sprintVersion.id);
    expect(fetched.name).toBe(sprintVersion.name);
  });

  test("lists versions for project and finds sprint version", async () => {
    if (!versionModuleAvailable || !sprintVersion?.id) return;
    const versions = await client.listVersions(project.id);
    const ids = versions.map((v) => v.id);
    expect(ids).toContain(sprintVersion.id);
  });

  test("generates sprint summary via weekly_summary helper", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 100 });
    const summary = buildWeeklySummary(project, wps);
    expect(summary).toContain("# Weekly Status");
    expect(summary.length).toBeGreaterThan(50);
  });
});
