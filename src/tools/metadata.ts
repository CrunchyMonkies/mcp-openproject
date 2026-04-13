import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client.js";
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
}
