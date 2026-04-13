import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { checkProjectModule } from "../modules.js";

export function registerRevisionTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_revisions",
    "List revisions for a project.",
    {
      projectId: z.number().int().describe("Project ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await checkProjectModule(client, params.projectId, "repository", "list_revisions");
        const revisions = await client.listRevisions(params.projectId);
        if (revisions.length === 0) return { content: [{ type: "text", text: "No revisions found." }] };
        return { content: [{ type: "text", text: JSON.stringify(revisions, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_revision",
    "Get details for a single revision by ID.",
    {
      id: z.number().int().describe("Revision ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const revision = await client.getRevision(params.id);
        return { content: [{ type: "text", text: JSON.stringify(revision, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
