import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerPrincipalTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_principals",
    "List principals (users, groups, placeholder users).",
    {
      limit: z.number().int().min(1).max(500).optional().describe("Max principals to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const principals = await client.listPrincipals({ limit: params.limit });
        if (principals.length === 0) return { content: [{ type: "text", text: "No principals found." }] };
        return { content: [{ type: "text", text: JSON.stringify(principals, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
