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

describe("Activities (read-only)", () => {
  test("lists activities for a work package and verifies structure", async () => {
    // Get a WP from the project to list activities for
    const wps = await client.listWorkPackages(project.id, { limit: 10 });
    if (wps.length === 0) {
      console.warn("[e2e] No work packages found, skipping listActivities test");
      return;
    }

    const wpId = wps[0].id;
    const activities = await client.listActivities(wpId);

    expect(Array.isArray(activities)).toBe(true);
    // Activities may be empty for a brand-new WP but the API call should succeed
    for (const a of activities) {
      expect(typeof a.id).toBe("number");
      expect(a.id).toBeGreaterThan(0);
      expect(a.createdAt).toBeTruthy();
    }
  });

  test("gets first activity by id if activities exist", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 10 });
    if (wps.length === 0) {
      console.warn("[e2e] No work packages found, skipping getActivity test");
      return;
    }

    // Try several WPs to find one with activities
    let firstActivityId: number | null = null;
    for (const wp of wps) {
      const acts = await client.listActivities(wp.id);
      if (acts.length > 0) {
        firstActivityId = acts[0].id;
        break;
      }
    }

    if (firstActivityId === null) {
      console.warn("[e2e] No activities found in any WP, skipping getActivity test");
      return;
    }

    const activity = await client.getActivity(firstActivityId);
    expect(typeof activity.id).toBe("number");
    expect(activity.id).toBe(firstActivityId);
    expect(activity.createdAt).toBeTruthy();
  });
});
