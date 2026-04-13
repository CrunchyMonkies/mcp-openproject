import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, News } from "../../src/schemas/index.js";

let client: OpenProjectClient;
let project: Project;
let createdNews: News | undefined;
let moduleAvailable = false;

const ts = Date.now();

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();

  // Probe whether the news module is enabled on this project
  try {
    const probe = await client.createNews({
      title: `[E2E-PROBE] News ${ts}`,
      projectId: project.id,
    });
    moduleAvailable = true;
    createdNews = probe;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 403) {
      moduleAvailable = false;
      console.warn("[e2e] News module not enabled on test project — skipping news tests");
    } else {
      throw err;
    }
  }
});

afterAll(async () => {
  if (createdNews?.id) {
    try {
      await client.deleteNews(createdNews.id);
    } catch {
      console.warn(`[e2e cleanup] Could not delete news #${createdNews.id}`);
    }
  }
});

describe("News lifecycle", () => {
  test("creates news with title and projectId", () => {
    if (!moduleAvailable) return;
    expect(createdNews).toBeDefined();
    expect(typeof createdNews!.id).toBe("number");
    expect(createdNews!.id).toBeGreaterThan(0);
    expect(createdNews!.title).toBe(`[E2E-PROBE] News ${ts}`);
  });

  test("gets news by id and verifies title", async () => {
    if (!moduleAvailable || !createdNews?.id) return;

    const fetched = await client.getNews(createdNews.id);
    expect(fetched.id).toBe(createdNews.id);
    expect(fetched.title).toBe(createdNews.title);
    expect(fetched._links?.self?.href).toContain(`/news/${createdNews.id}`);
  });

  test("lists news for project and verifies created news appears", async () => {
    if (!moduleAvailable || !createdNews?.id) return;

    const newsList = await client.listNews({ projectId: project.id });
    expect(Array.isArray(newsList)).toBe(true);

    const ids = newsList.map((n) => n.id);
    expect(ids).toContain(createdNews.id);

    for (const n of newsList) {
      expect(typeof n.id).toBe("number");
      expect(n.id).toBeGreaterThan(0);
      expect(typeof n.title).toBe("string");
    }
  });

  test("updates news title and verifies persistence", async () => {
    if (!moduleAvailable || !createdNews?.id) return;

    const newTitle = `[E2E-TEST] News Updated ${ts}`;
    const updated = await client.updateNews(createdNews.id, { title: newTitle });

    expect(updated.id).toBe(createdNews.id);
    expect(updated.title).toBe(newTitle);

    const refetched = await client.getNews(createdNews.id);
    expect(refetched.title).toBe(newTitle);
  });

  test("deletes news without throwing", async () => {
    if (!moduleAvailable || !createdNews?.id) return;

    await expect(client.deleteNews(createdNews.id)).resolves.not.toThrow();
    createdNews = undefined;
  });
});
