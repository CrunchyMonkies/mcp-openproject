import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { linkTitle } from "../../src/helpers.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage, TimeEntry } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();
const ts = Date.now();
const today = new Date().toISOString().slice(0, 10);

let bug: WorkPackage;
let timeEntry: TimeEntry | undefined;
let timeTrackingAvailable = false;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

afterAll(async () => {
  if (timeEntry?.id) {
    try { await client.deleteTimeEntry(timeEntry.id); } catch { /* ignore */ }
  }
  await tracker.cleanup(client);
});

describe("Issue tracking lifecycle", () => {
  test("lists priorities and captures available values", async () => {
    const priorities = await client.getPriorities();
    expect(priorities.length).toBeGreaterThan(0);
  });

  test("creates bug work package with repro steps", async () => {
    const subject = `[E2E-WF] Bug Report ${ts}`;
    const description = "Steps to reproduce:\n1. Step one\n2. Step two\n\nExpected: foo\nActual: bar";
    try {
      bug = await client.createWorkPackage(project, subject, "Bug", description);
    } catch {
      bug = await client.createWorkPackage(project, subject, "Task", description);
    }
    tracker.trackWorkPackage(bug.id);
    expect(bug.id).toBeGreaterThan(0);
    expect(bug.subject).toBe(subject);
  });

  test("transitions bug status New -> In progress", async () => {
    const updated = await client.updateWorkPackageStatus(bug.id, "In progress");
    expect(linkTitle(updated, "status", "")).toBe("In progress");
  });

  test("adds investigation comment", async () => {
    const result = await client.addComment(bug.id, `Investigation notes ${ts}: root cause suspected in helper module`);
    expect(result).toBeDefined();
  });

  test("logs time entry against bug (if module available)", async () => {
    try {
      timeEntry = await client.createTimeEntry({
        hours: "PT1H",
        spentOn: today,
        workPackageId: bug.id,
        comment: "Investigation time",
      });
      timeTrackingAvailable = true;
      expect(timeEntry.id).toBeGreaterThan(0);
      expect(timeEntry.hours).toBe("PT1H");
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 403) {
        console.warn("[e2e] Time tracking not available, skipping");
        return;
      }
      throw err;
    }
  });

  test("lists time entries for the project and finds the logged entry", async () => {
    if (!timeTrackingAvailable || !timeEntry?.id) return;
    try {
      const entries = await client.listTimeEntries({ projectId: project.id, limit: 500 });
      const ids = entries.map((e) => e.id);
      expect(ids).toContain(timeEntry.id);
    } catch (err: any) {
      if (err?.statusCode === 400 || err?.message?.includes("filter does not exist")) {
        console.warn("[e2e] Time entry filtering not supported on this instance, skipping");
        return;
      }
      throw err;
    }
  });

  test("closes the bug", async () => {
    let closed: WorkPackage;
    try {
      closed = await client.updateWorkPackageStatus(bug.id, "Closed");
    } catch {
      closed = await client.updateWorkPackageStatus(bug.id, "Rejected");
    }
    expect(["Closed", "Rejected"]).toContain(linkTitle(closed, "status", ""));
  });

  test("lists activities showing the audit trail", async () => {
    const activities = await client.listActivities(bug.id);
    expect(Array.isArray(activities)).toBe(true);
    // Should have activities from: create, status change x2, comment
    expect(activities.length).toBeGreaterThan(0);
  });
});
