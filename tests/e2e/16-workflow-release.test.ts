import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { linkTitle } from "../../src/helpers.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage, Version } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();
const ts = Date.now();

let releaseVersion: Version | undefined;
let versionModuleAvailable = false;
let milestone: WorkPackage;
let featureA: WorkPackage;
let featureB: WorkPackage;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();

  try {
    const probe = await client.createVersion({
      name: `[E2E-WF] Release-v${ts}`,
      projectId: project.id,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    versionModuleAvailable = true;
    releaseVersion = probe;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 403) {
      versionModuleAvailable = false;
      console.warn("[e2e] Versions module not enabled");
    } else {
      throw err;
    }
  }
});

afterAll(async () => {
  if (releaseVersion?.id) {
    try { await client.deleteVersion(releaseVersion.id); } catch { /* ignore */ }
  }
  await tracker.cleanup(client);
});

describe("Release management workflow", () => {
  test("creates release version", () => {
    if (!versionModuleAvailable) return;
    expect(releaseVersion!.id).toBeGreaterThan(0);
  });

  test("creates milestone WP for Feature Freeze", async () => {
    // Try Milestone type first, fallback to Task
    try {
      milestone = await client.createWorkPackage(project, `[E2E-WF] Feature Freeze ${ts}`, "Milestone", "Feature freeze milestone");
    } catch {
      milestone = await client.createWorkPackage(project, `[E2E-WF] Feature Freeze ${ts}`, "Task", "Feature freeze milestone");
    }
    tracker.trackWorkPackage(milestone.id);
    expect(milestone.id).toBeGreaterThan(0);
  });

  test("creates 2 feature WPs", async () => {
    featureA = await client.createWorkPackage(project, `[E2E-WF] Feature-A ${ts}`, "Task", "Feature A for release");
    featureB = await client.createWorkPackage(project, `[E2E-WF] Feature-B ${ts}`, "Task", "Feature B for release");
    tracker.trackWorkPackage(featureA.id);
    tracker.trackWorkPackage(featureB.id);
    expect(featureA.id).toBeGreaterThan(0);
    expect(featureB.id).toBeGreaterThan(0);
  });

  test("creates precedes/follows relation between featureA and milestone", async () => {
    const rel = await client.createRelation(featureA.id, milestone.id, "precedes");
    // OpenProject normalizes precedes/follows symmetrically — accept either
    expect(["precedes", "follows"]).toContain(rel.type);
    const toHref = (rel._links as Record<string, any>)?.to?.href;
    expect(toHref).toBeTruthy();
  });

  test("creates precedes/follows relation between featureB and milestone", async () => {
    const rel = await client.createRelation(featureB.id, milestone.id, "precedes");
    expect(["precedes", "follows"]).toContain(rel.type);
  });

  test("lists relations on featureA and verifies precedes/follows relation exists", async () => {
    const relations = await client.listWorkPackageRelations(featureA.id);
    const found = relations.find((r) => r.type === "precedes" || r.type === "follows");
    expect(found).toBeDefined();
  });

  test("gets release version and verifies metadata", async () => {
    if (!versionModuleAvailable || !releaseVersion?.id) return;
    const fetched = await client.getVersion(releaseVersion.id);
    expect(fetched.id).toBe(releaseVersion.id);
    expect(fetched.name).toBe(releaseVersion.name);
  });

  test("lists project work packages and finds milestone + features", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 500 });
    const ids = wps.map((w) => w.id);
    expect(ids).toContain(milestone.id);
    expect(ids).toContain(featureA.id);
    expect(ids).toContain(featureB.id);
  });
});
