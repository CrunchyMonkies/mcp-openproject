import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage, TimeEntry } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
let testWp: WorkPackage;
let createdEntry: TimeEntry;

const ts = Date.now();
const today = new Date().toISOString().slice(0, 10);

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();

  // Create a work package to attach time entries to
  testWp = await client.createWorkPackage(
    project,
    `[E2E-TEST] TimeEntry WP ${ts}`,
    "Task",
    "Work package for time entry e2e tests",
  );
});

afterAll(async () => {
  // Close the test work package
  if (testWp?.id) {
    try {
      await client.updateWorkPackage(testWp.id, { statusName: "Closed" });
    } catch {
      try {
        await client.updateWorkPackage(testWp.id, { statusName: "Rejected" });
      } catch {
        console.warn(`[e2e cleanup] Could not close WP #${testWp.id}`);
      }
    }
  }
});

describe("Time entry lifecycle", () => {
  test("creates time entry with hours and spentOn", async () => {
    createdEntry = await client.createTimeEntry({
      hours: "PT1H",
      spentOn: today,
      workPackageId: testWp.id,
    });

    expect(typeof createdEntry.id).toBe("number");
    expect(createdEntry.id).toBeGreaterThan(0);
    expect(createdEntry.hours).toBe("PT1H");
    expect(createdEntry.spentOn).toBe(today);
  });

  test("gets time entry by id and verifies hours and spentOn match", async () => {
    const fetched = await client.getTimeEntry(createdEntry.id);

    expect(fetched.id).toBe(createdEntry.id);
    expect(fetched.hours).toBe("PT1H");
    expect(fetched.spentOn).toBe(today);
    expect(fetched._links?.self?.href).toContain(`/time_entries/${createdEntry.id}`);
  });

  test("lists time entries and verifies created entry appears", async () => {
    // List by projectId — workPackageId filter is not supported on all instances
    const entries = await client.listTimeEntries({ projectId: project.id });

    expect(Array.isArray(entries)).toBe(true);
    const ids = entries.map((e) => e.id);
    expect(ids).toContain(createdEntry.id);

    for (const e of entries) {
      expect(typeof e.id).toBe("number");
      expect(e.id).toBeGreaterThan(0);
    }
  });

  test("updates time entry hours to PT2H and verifies", async () => {
    const updated = await client.updateTimeEntry(createdEntry.id, {
      hours: "PT2H",
    });

    expect(updated.id).toBe(createdEntry.id);
    expect(updated.hours).toBe("PT2H");

    // Verify by re-fetching
    const refetched = await client.getTimeEntry(createdEntry.id);
    expect(refetched.hours).toBe("PT2H");
  });

  test("deletes time entry without throwing", async () => {
    await expect(client.deleteTimeEntry(createdEntry.id)).resolves.not.toThrow();
  });
});
