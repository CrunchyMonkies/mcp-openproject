import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerCommentTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "add_comment",
    "Add a comment/note to a work package.",
    {
      id: z.number().int().describe("Work package ID."),
      comment: z.string().describe("Comment text."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.addComment(params.id, params.comment);
        return {
          content: [{ type: "text", text: `Added comment to work package #${params.id}.` }],
        };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
