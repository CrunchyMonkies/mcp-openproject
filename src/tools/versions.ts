import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { truncate } from "../helpers.js";
import { checkProjectModule } from "../modules.js";

export function registerVersionTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_versions",
    "List versions for a project.",
    {
      project: z.string().describe("Project ID or identifier."),
    },
    async (params) => {
      try {
        const client = getClient();
        const project = await client.resolveProject(params.project);
        await checkProjectModule(client, project.id, "versions", "list_versions");
        const versions = await client.listVersions(project.id);
        if (versions.length === 0) return { content: [{ type: "text", text: "No versions found." }] };
        const lines = ["ID   Name                           Status     Start       End", "---  -----------------------------  ---------  ----------  ----------"];
        for (const v of versions) {
          const id = String(v.id || "?").padEnd(3);
          const name = truncate(String(v.name || "-"), 29).padEnd(29);
          const status = truncate(String(v.status || "-"), 9).padEnd(9);
          const start = String(v.startDate || "-").padEnd(10);
          const end = String(v.endDate || "-");
          lines.push(`${id}  ${name}  ${status}  ${start}  ${end}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_version",
    "Get details for a single version by ID.",
    {
      id: z.number().int().describe("Version ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const version = await client.getVersion(params.id);
        return { content: [{ type: "text", text: JSON.stringify(version, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_version",
    "Create a new version in a project.",
    {
      name: z.string().describe("Version name."),
      project: z.string().describe("Project ID or identifier."),
      description: z.string().optional().describe("Version description."),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)."),
      endDate: z.string().optional().describe("End date (YYYY-MM-DD)."),
      status: z.string().optional().describe("Version status (open, locked, closed)."),
      sharing: z.string().optional().describe("Sharing setting (none, descendants, hierarchy, tree, system)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const project = await client.resolveProject(params.project);
        await checkProjectModule(client, project.id, "versions", "create_version");
        const version = await client.createVersion({
          name: params.name,
          projectId: project.id,
          description: params.description,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          sharing: params.sharing,
        });
        return { content: [{ type: "text", text: JSON.stringify(version, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_version",
    "Update an existing version.",
    {
      id: z.number().int().describe("Version ID."),
      name: z.string().optional().describe("New version name."),
      description: z.string().optional().describe("New description."),
      startDate: z.string().optional().describe("New start date (YYYY-MM-DD)."),
      endDate: z.string().optional().describe("New end date (YYYY-MM-DD)."),
      status: z.string().optional().describe("New status (open, locked, closed)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const version = await client.updateVersion(params.id, {
          name: params.name,
          description: params.description,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
        });
        return { content: [{ type: "text", text: JSON.stringify(version, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_version",
    "Delete a version by ID.",
    {
      id: z.number().int().describe("Version ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteVersion(params.id);
        return { content: [{ type: "text", text: `Deleted version #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
