import { describe, test, expect } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { buildWeeklySummary, buildDecisionMarkdown } from "../../src/tools/knowledge.js";

describe("Knowledge artifacts", () => {
  test("generates weekly summary with real project data", async () => {
    const client = getTestClient();
    const project = await getTestProject();
    const wps = await client.listWorkPackages(project.id, { limit: 50 });

    const summary = buildWeeklySummary(project, wps);

    // Verify markdown structure
    expect(summary).toContain("# Weekly Status");
    expect(summary).toContain("## Wins / completed");
    expect(summary).toContain("## In progress");
    expect(summary).toContain("## Blockers / risks");
    expect(summary).toContain("## Next focus");

    // Verify it includes the real project name
    expect(summary).toContain(project.name);

    // Verify it includes today's date
    const today = new Date().toISOString().slice(0, 10);
    expect(summary).toContain(`Date: ${today}`);

    // If there are work packages, they should appear as list items with WP IDs
    if (wps.length > 0) {
      // At least one WP should appear as a "- #ID" line
      expect(summary).toMatch(/- #\d+/);
    }
  });

  test("generates decision log with all provided fields", () => {
    const markdown = buildDecisionMarkdown(
      "2026-04-13",
      "test-project",
      "Use vitest for e2e tests",
      "Adopt vitest as the test framework",
      "Need a modern ESM-native test runner",
      "Faster test execution, better DX",
      "Set up CI pipeline",
    );

    // Verify all sections present with correct content
    expect(markdown).toContain("# Decision: Use vitest for e2e tests");
    expect(markdown).toContain("Date: 2026-04-13");
    expect(markdown).toContain("Project: test-project");
    expect(markdown).toContain("## Context");
    expect(markdown).toContain("Need a modern ESM-native test runner");
    expect(markdown).toContain("## Decision");
    expect(markdown).toContain("Adopt vitest as the test framework");
    expect(markdown).toContain("## Impact");
    expect(markdown).toContain("Faster test execution, better DX");
    expect(markdown).toContain("## Follow-up");
    expect(markdown).toContain("Set up CI pipeline");
  });

  test("generates decision log with empty optional fields", () => {
    const markdown = buildDecisionMarkdown(
      "2026-04-13",
      "test-project",
      "Minimal decision",
      "Just the decision text",
      "",
      "",
      "",
    );

    expect(markdown).toContain("# Decision: Minimal decision");
    expect(markdown).toContain("## Context");
    expect(markdown).toContain("(none provided)");
    expect(markdown).toContain("## Impact");
    expect(markdown).toContain("(to be assessed)");
    expect(markdown).toContain("## Follow-up");
    expect(markdown).toContain("(none)");
  });
});
