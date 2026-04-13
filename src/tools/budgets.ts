import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerBudgetTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "get_budget",
    "Get details for a single budget by ID.",
    {
      id: z.number().int().describe("Budget ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const budget = await client.getBudget(params.id);
        return { content: [{ type: "text", text: JSON.stringify(budget, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
