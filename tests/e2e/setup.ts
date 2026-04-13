import { OpenProjectClient } from "../../src/client/index.js";
import type { Project } from "../../src/types.js";

let cachedClient: OpenProjectClient | null = null;
let cachedProject: Project | null = null;

export function getTestClient(): OpenProjectClient {
  if (cachedClient) return cachedClient;
  const baseUrl = process.env.OPENPROJECT_BASE_URL;
  const apiToken = process.env.OPENPROJECT_API_TOKEN;
  if (!baseUrl || !apiToken) {
    throw new Error(
      "E2E tests require OPENPROJECT_BASE_URL and OPENPROJECT_API_TOKEN in .env.test",
    );
  }
  cachedClient = new OpenProjectClient({ baseUrl, apiToken });
  return cachedClient;
}

export async function getTestProject(): Promise<Project> {
  if (cachedProject) return cachedProject;
  const client = getTestClient();
  const projects = await client.getProjects(10);
  if (projects.length === 0) {
    throw new Error("No projects found on OpenProject instance");
  }
  cachedProject = projects[0];
  return cachedProject;
}
