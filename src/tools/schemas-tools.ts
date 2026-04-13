import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerSchemaTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "get_work_package_schema",
    "Get the work package schema, optionally scoped to a project.",
    {
      project: z.number().int().optional().describe("Project ID to get the project-specific work package schema."),
    },
    async (params) => {
      try {
        const client = getClient();
        const schema = await client.getWorkPackageSchema(params.project);
        return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_project_schema",
    "Get the project schema describing all project fields.",
    {},
    async () => {
      try {
        const client = getClient();
        const schema = await client.getProjectSchema();
        return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
