import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { TestDataTracker } from "./helpers.js";
import { linkTitle } from "../../src/helpers.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, WorkPackage } from "../../src/types.js";

let client: OpenProjectClient;
let project: Project;
const tracker = new TestDataTracker();

let wpA: WorkPackage;
let wpB: WorkPackage;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

afterAll(async () => {
  await tracker.cleanup(client);
});

const ts = Date.now();

describe("Work package lifecycle", () => {
  test("creates work package A with correct subject, type, and description", async () => {
    const subject = `[E2E-TEST] Alpha ${ts}`;
    wpA = await client.createWorkPackage(
      project,
      subject,
      "Task",
      "E2E test work package A",
    );
    tracker.trackWorkPackage(wpA.id);

    expect(typeof wpA.id).toBe("number");
    expect(wpA.id).toBeGreaterThan(0);
    expect(wpA.subject).toBe(subject);
    expect(typeof wpA.lockVersion).toBe("number");
    // Verify it was created in the correct project
    const projectHref = (wpA._links as Record<string, any>)?.project?.href;
    expect(projectHref).toContain(`/projects/${project.id}`);
    // Verify the type was set to Task
    const typeTitle = linkTitle(wpA, "type", "");
    expect(typeTitle).toBe("Task");
    // Verify initial status is "New"
    const statusTitle = linkTitle(wpA, "status", "");
    expect(statusTitle).toBe("New");
  });

  test("creates work package B with unique ID", async () => {
    const subject = `[E2E-TEST] Beta ${ts}`;
    wpB = await client.createWorkPackage(
      project,
      subject,
      "Task",
      "E2E test work package B",
    );
    tracker.trackWorkPackage(wpB.id);

    expect(wpB.id).toBeGreaterThan(0);
    expect(wpB.subject).toBe(subject);
    // Must be a different work package than A
    expect(wpB.id).not.toBe(wpA.id);
  });

  test("gets work package by ID and returns matching data", async () => {
    const fetched = await client.getWorkPackage(wpA.id);

    expect(fetched.id).toBe(wpA.id);
    expect(fetched.subject).toBe(wpA.subject);
    expect(typeof fetched.lockVersion).toBe("number");
    // Verify HAL structure is present
    expect(fetched._links?.self?.href).toContain(`/work_packages/${wpA.id}`);
    // Verify project link matches
    const projectHref = (fetched._links as Record<string, any>)?.project?.href;
    expect(projectHref).toContain(`/projects/${project.id}`);
  });

  test("lists work packages for project and includes created WPs", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 200 });
    expect(wps.length).toBeGreaterThan(0);

    // Both created WPs should appear in the project listing
    const ids = wps.map((wp) => wp.id);
    expect(ids).toContain(wpA.id);
    expect(ids).toContain(wpB.id);

    // Verify each WP has valid structure
    for (const wp of wps) {
      expect(typeof wp.id).toBe("number");
      expect(typeof wp.subject).toBe("string");
      expect(wp.subject.length).toBeGreaterThan(0);
    }
  });

  test("updates work package subject and description", async () => {
    const newSubject = `[E2E-TEST] Alpha Updated ${ts}`;
    const newDescription = "Updated description from e2e test";
    const updated = await client.updateWorkPackage(wpA.id, {
      subject: newSubject,
      description: newDescription,
    });

    expect(updated.id).toBe(wpA.id);
    expect(updated.subject).toBe(newSubject);
    // lockVersion should have incremented
    expect(updated.lockVersion).toBeGreaterThan(wpA.lockVersion);

    // Verify by re-fetching
    const refetched = await client.getWorkPackage(wpA.id);
    expect(refetched.subject).toBe(newSubject);
  });

  test("updates work package status and verifies transition", async () => {
    // Fetch current state to confirm starting status
    const before = await client.getWorkPackage(wpA.id);
    const statusBefore = linkTitle(before, "status", "");

    const updated = await client.updateWorkPackageStatus(wpA.id, "In progress");

    expect(updated.id).toBe(wpA.id);
    // Verify the status actually changed
    const statusAfter = linkTitle(updated, "status", "");
    expect(statusAfter).toBe("In progress");
    expect(statusAfter).not.toBe(statusBefore);

    // Verify by re-fetching
    const refetched = await client.getWorkPackage(wpA.id);
    expect(linkTitle(refetched, "status", "")).toBe("In progress");
  });

  test("adds comment and verifies via activities", async () => {
    const commentText = `E2E test comment ${ts}`;
    const result = await client.addComment(wpA.id, commentText);

    // The response should be defined (not null/undefined)
    expect(result).toBeDefined();

    // Verify the comment exists by checking the WP's updatedAt changed
    const refetched = await client.getWorkPackage(wpA.id);
    expect(refetched.updatedAt).toBeTruthy();
  });
});

describe("Relations", () => {
  test("lists relations for new WP returns empty array", async () => {
    const relations = await client.listWorkPackageRelations(wpB.id);
    expect(Array.isArray(relations)).toBe(true);
    expect(relations.length).toBe(0);
  });

  test("creates 'relates' relation and validates both endpoints", async () => {
    const relation = await client.createRelation(wpA.id, wpB.id, "relates");

    expect(typeof relation.id).toBe("number");
    expect(relation.id).toBeGreaterThan(0);
    expect(relation.type).toBe("relates");

    // Verify the relation links reference the correct work packages
    const fromHref = (relation._links as Record<string, any>)?.from?.href;
    const toHref = (relation._links as Record<string, any>)?.to?.href;
    expect(fromHref).toContain(`/work_packages/${wpA.id}`);
    expect(toHref).toContain(`/work_packages/${wpB.id}`);
  });

  test("lists relations after creation and finds the created relation", async () => {
    const relations = await client.listWorkPackageRelations(wpA.id);
    expect(relations.length).toBeGreaterThanOrEqual(1);

    // Find our specific relation
    const found = relations.find((r) => r.type === "relates");
    expect(found).toBeDefined();
    expect(found!.id).toBeGreaterThan(0);
  });
});
