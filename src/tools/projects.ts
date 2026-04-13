import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { truncate } from "../helpers.js";
import type { Project } from "../types.js";

function formatProjects(projects: Project[]): string {
  if (projects.length === 0) return "No projects found.";

  const lines = ["ID   Identifier            Name", "---  --------------------  ------------------------------"];
  for (const p of projects) {
    const id = String(p.id || "?");
    const identifier = truncate(String(p.identifier || "-"), 20).padEnd(20);
    const name = truncate(String(p.name || "-"), 30);
    lines.push(`${id.padEnd(4)} ${identifier}  ${name}`);
  }
  return lines.join("\n");
}

export function registerProjectTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_projects",
    "List all visible OpenProject projects with their ID, identifier, and name.",
    {},
    async () => {
      try {
        const client = getClient();
        const projects = await client.getProjects();
        return { content: [{ type: "text", text: formatProjects(projects) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_project",
    "Get details for a single project by numeric ID.",
    {
      id: z.number().int().describe("Project ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const project = await client.getProject(params.id);
        return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_project",
    "Create a new OpenProject project.",
    {
      name: z.string().describe("Project name."),
      identifier: z.string().optional().describe("Unique project identifier (slug)."),
      description: z.string().optional().describe("Project description."),
      public: z.boolean().optional().describe("Whether the project is publicly visible."),
    },
    async (params) => {
      try {
        const client = getClient();
        const project = await client.createProject({
          name: params.name,
          identifier: params.identifier,
          description: params.description !== undefined ? { raw: params.description } : undefined,
          public: params.public,
        });
        return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_project",
    "Update fields on an existing project.",
    {
      id: z.number().int().describe("Project ID."),
      name: z.string().optional().describe("New project name."),
      description: z.string().optional().describe("New project description."),
      public: z.boolean().optional().describe("Whether the project is publicly visible."),
      active: z.boolean().optional().describe("Whether the project is active."),
    },
    async (params) => {
      try {
        const client = getClient();
        const project = await client.updateProject(params.id, {
          name: params.name,
          description: params.description !== undefined ? { raw: params.description } : undefined,
          public: params.public,
          active: params.active,
        });
        return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_project",
    "Delete a project by ID.",
    {
      id: z.number().int().describe("Project ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteProject(params.id);
        return { content: [{ type: "text", text: `Deleted project #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
