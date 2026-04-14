import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import { buildWeeklySummary, buildDecisionMarkdown } from "../../src/tools/knowledge.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, News } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
const ts = Date.now();
const today = new Date().toISOString().slice(0, 10);

let createdNews: News | undefined;
let newsModuleAvailable = false;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

afterAll(async () => {
  if (createdNews?.id) {
    try { await client.deleteNews(createdNews.id); } catch { /* ignore */ }
  }
});

describe("Stakeholder reporting workflow", () => {
  test("generates weekly_summary markdown from live project data", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 100 });
    const summary = buildWeeklySummary(project, wps);

    expect(summary).toContain("# Weekly Status");
    expect(summary).toContain(project.name);
    expect(summary).toContain(`Date: ${today}`);
    expect(summary).toContain("## Wins / completed");
    expect(summary).toContain("## In progress");
    expect(summary).toContain("## Blockers / risks");
    expect(summary).toContain("## Next focus");
  });

  test("generates decision log markdown with all fields", () => {
    const markdown = buildDecisionMarkdown(
      today,
      project.identifier,
      `Stakeholder scope change ${ts}`,
      "Defer feature X to next release",
      "Capacity constraints identified in sprint planning",
      "Release date holds, stakeholders notified",
      "Communicate change to customer advisory board",
    );
    expect(markdown).toContain(`# Decision: Stakeholder scope change ${ts}`);
    expect(markdown).toContain(`Date: ${today}`);
    expect(markdown).toContain(`Project: ${project.identifier}`);
    expect(markdown).toContain("## Context");
    expect(markdown).toContain("Capacity constraints");
    expect(markdown).toContain("## Decision");
    expect(markdown).toContain("Defer feature X");
    expect(markdown).toContain("## Impact");
    expect(markdown).toContain("## Follow-up");
  });

  test("lists project work packages for reporting", async () => {
    const wps = await client.listWorkPackages(project.id, { limit: 50 });
    expect(Array.isArray(wps)).toBe(true);
    for (const wp of wps.slice(0, 5)) {
      expect(typeof wp.id).toBe("number");
      expect(typeof wp.subject).toBe("string");
    }
  });

  test("publishes news item (if module available)", async () => {
    try {
      createdNews = await client.createNews({
        title: `[E2E-WF] Stakeholder Update ${ts}`,
        projectId: project.id,
        summary: "Weekly stakeholder update",
        description: "Published as part of e2e workflow test",
      });
      newsModuleAvailable = true;
      expect(createdNews.id).toBeGreaterThan(0);
      expect(createdNews.title).toContain("Stakeholder Update");
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 403) {
        console.warn("[e2e] News module not available, skipping");
        return;
      }
      throw err;
    }
  });

  test("retrieves published news", async () => {
    if (!newsModuleAvailable || !createdNews?.id) return;
    const fetched = await client.getNews(createdNews.id);
    expect(fetched.id).toBe(createdNews.id);
    expect(fetched.title).toBe(createdNews.title);
  });
});
