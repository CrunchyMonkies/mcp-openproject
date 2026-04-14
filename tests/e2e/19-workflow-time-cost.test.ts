import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { buildDecisionMarkdown } from "../../src/tools/knowledge.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage, TimeEntry } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();
const ts = Date.now();
const today = new Date().toISOString().slice(0, 10);

let targetWp: WorkPackage;
let entry1: TimeEntry | undefined;
let entry2: TimeEntry | undefined;
let timeTrackingAvailable = false;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
  targetWp = await client.createWorkPackage(project, `[E2E-WF] TimeCost-Target ${ts}`, "Task", "Time/cost reporting target");
  tracker.trackWorkPackage(targetWp.id);
});

afterAll(async () => {
  if (entry1?.id) { try { await client.deleteTimeEntry(entry1.id); } catch { /* ignore */ } }
  if (entry2?.id) { try { await client.deleteTimeEntry(entry2.id); } catch { /* ignore */ } }
  await tracker.cleanup(client);
});

describe("Time and cost reporting workflow", () => {
  test("logs first time entry (PT1H) against target WP", async () => {
    try {
      entry1 = await client.createTimeEntry({
        hours: "PT1H",
        spentOn: today,
        workPackageId: targetWp.id,
        comment: "First session — investigation",
      });
      timeTrackingAvailable = true;
      expect(entry1.id).toBeGreaterThan(0);
      expect(entry1.hours).toBe("PT1H");
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 403) {
        console.warn("[e2e] Time tracking not available");
        return;
      }
      throw err;
    }
  });

  test("logs second time entry (PT2H) against same WP", async () => {
    if (!timeTrackingAvailable) return;
    entry2 = await client.createTimeEntry({
      hours: "PT2H",
      spentOn: today,
      workPackageId: targetWp.id,
      comment: "Second session — implementation",
    });
    expect(entry2.id).toBeGreaterThan(0);
    expect(entry2.hours).toBe("PT2H");
  });

  test("lists time entries filtered by project and verifies both appear", async () => {
    if (!timeTrackingAvailable) return;
    const entries = await client.listTimeEntries({ projectId: project.id, limit: 500 });
    const ids = entries.map((e) => e.id);
    if (entry1?.id) expect(ids).toContain(entry1.id);
    if (entry2?.id) expect(ids).toContain(entry2.id);
  });

  test("lists time entries filtered by work package (if supported)", async () => {
    if (!timeTrackingAvailable) return;
    try {
      const entries = await client.listTimeEntries({ workPackageId: targetWp.id, limit: 500 });
      expect(Array.isArray(entries)).toBe(true);
    } catch (err: any) {
      if (err?.statusCode === 400 || err?.message?.includes("filter does not exist")) {
        console.warn("[e2e] Work package filter for time entries not supported on this instance, skipping");
        return;
      }
      throw err;
    }
  });

  test("gets work package and inspects spent time field if available", async () => {
    if (!timeTrackingAvailable) return;
    const wp = await client.getWorkPackage(targetWp.id);
    expect(wp.id).toBe(targetWp.id);
    // spentTime may or may not be populated depending on instance config
  });

  test("generates budget decision log for variance", () => {
    const markdown = buildDecisionMarkdown(
      today,
      project.identifier,
      `Budget variance review ${ts}`,
      "Approve 10% budget overrun for this iteration",
      "Scope creep driven by stakeholder feedback",
      "Projected delivery extends by 1 week",
      "Revise forecast in next portfolio review",
    );
    expect(markdown).toContain("# Decision: Budget variance review");
    expect(markdown).toContain("## Context");
    expect(markdown).toContain("## Decision");
    expect(markdown).toContain("## Impact");
    expect(markdown).toContain("## Follow-up");
  });
});
