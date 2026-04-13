import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerAttachmentTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "get_attachment",
    "Get details for a single attachment by ID.",
    {
      id: z.number().int().describe("Attachment ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const attachment = await client.getAttachment(params.id);
        return { content: [{ type: "text", text: JSON.stringify(attachment, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_attachment",
    "Delete an attachment by ID.",
    {
      id: z.number().int().describe("Attachment ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteAttachment(params.id);
        return { content: [{ type: "text", text: `Deleted attachment #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
