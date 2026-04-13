import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpenProjectClient } from "../client.js";
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
}
