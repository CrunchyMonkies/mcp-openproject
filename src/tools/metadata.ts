import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { truncate } from "../helpers.js";
import type { Priority, Status, Type } from "../types.js";

function formatStatuses(statuses: Status[]): string {
  if (statuses.length === 0) return "No statuses returned.";
  const lines = ["ID   Name                       Closed", "---  -------------------------  ------"];
  for (const s of statuses) {
    const id = String(s.id || "?").padEnd(3);
    const name = truncate(String(s.name || "-"), 25).padEnd(25);
    const closed = String(!!s.isClosed);
    lines.push(`${id}  ${name}  ${closed}`);
  }
  return lines.join("\n");
}

function formatTypes(types: Type[]): string {
  if (types.length === 0) return "No types returned.";
  const lines = ["ID   Name                       Milestone", "---  -------------------------  ---------"];
  for (const t of types) {
    const id = String(t.id || "?").padEnd(3);
    const name = truncate(String(t.name || "-"), 25).padEnd(25);
    const milestone = String(!!t.isMilestone);
    lines.push(`${id}  ${name}  ${milestone}`);
  }
  return lines.join("\n");
}

function formatPriorities(priorities: Priority[]): string {
  if (priorities.length === 0) return "No priorities returned.";
  const lines = ["ID   Name                       Position", "---  -------------------------  --------"];
  for (const p of priorities) {
    const id = String(p.id || "?").padEnd(3);
    const name = truncate(String(p.name || "-"), 25).padEnd(25);
    const position = String(p.position ?? "-");
    lines.push(`${id}  ${name}  ${position}`);
  }
  return lines.join("\n");
}

export function registerMetadataTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
  getDefaultProject: () => string | undefined,
): void {
  server.tool(
    "list_statuses",
    "List available work package statuses.",
    {},
    async () => {
      try {
        const client = getClient();
        const statuses = await client.getStatuses();
        return { content: [{ type: "text", text: formatStatuses(statuses) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_types",
    "List available work package types (optionally scoped to a project).",
    {
      project: z.string().optional().describe("Project ID or identifier for project-scoped types."),
    },
    async (params) => {
      try {
        const client = getClient();
        let projectId: number | undefined;
        const projectRef = params.project || getDefaultProject();
        const lines: string[] = [];

        if (projectRef) {
          const project = await client.resolveProject(projectRef);
          projectId = project.id;
          lines.push(`Project: ${project.identifier || project.name || project.id}`);
        }

        const types = await client.getTypes(projectId);
        lines.push(formatTypes(types));
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_priorities",
    "List available work package priorities.",
    {},
    async () => {
      try {
        const client = getClient();
        const priorities = await client.getPriorities();
        return { content: [{ type: "text", text: formatPriorities(priorities) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_roles",
    "List available roles.",
    {},
    async () => {
      try {
        const client = getClient();
        const roles = await client.getRoles();
        if (roles.length === 0) return { content: [{ type: "text", text: "No roles returned." }] };
        const lines = ["ID   Name", "---  ------------------------------"];
        for (const r of roles) {
          const id = String(r.id || "?").padEnd(3);
          const name = truncate(String(r.name || "-"), 30);
          lines.push(`${id}  ${name}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_role",
    "Get details for a single role by ID.",
    {
      id: z.number().int().describe("Role ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const role = await client.getRole(params.id);
        return { content: [{ type: "text", text: JSON.stringify(role, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_categories",
    "List categories for a project.",
    {
      project: z.string().describe("Project ID or identifier."),
    },
    async (params) => {
      try {
        const client = getClient();
        const project = await client.resolveProject(params.project);
        const categories = await client.getCategories(project.id);
        if (categories.length === 0) return { content: [{ type: "text", text: "No categories found." }] };
        const lines = ["ID   Name", "---  ------------------------------"];
        for (const c of categories) {
          const id = String(c.id || "?").padEnd(3);
          const name = truncate(String(c.name || "-"), 30);
          lines.push(`${id}  ${name}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_category",
    "Get details for a single category by ID.",
    {
      id: z.number().int().describe("Category ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const category = await client.getCategory(params.id);
        return { content: [{ type: "text", text: JSON.stringify(category, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
