import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerFileLinkTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_file_links",
    "List file links for a work package.",
    {
      workPackageId: z.number().int().describe("Work package ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const fileLinks = await client.listFileLinks(params.workPackageId);
        if (fileLinks.length === 0) return { content: [{ type: "text", text: "No file links found." }] };
        return { content: [{ type: "text", text: JSON.stringify(fileLinks, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_file_link",
    "Get details for a single file link by ID.",
    {
      id: z.number().int().describe("File link ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const fileLink = await client.getFileLink(params.id);
        return { content: [{ type: "text", text: JSON.stringify(fileLink, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_file_link",
    "Delete a file link by ID.",
    {
      id: z.number().int().describe("File link ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteFileLink(params.id);
        return { content: [{ type: "text", text: `Deleted file link #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
