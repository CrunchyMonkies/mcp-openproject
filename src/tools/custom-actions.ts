import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerCustomActionTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "get_custom_action",
    "Get details for a single custom action by ID.",
    {
      id: z.number().int().describe("Custom action ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const action = await client.getCustomAction(params.id);
        return { content: [{ type: "text", text: JSON.stringify(action, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "execute_custom_action",
    "Execute a custom action on a work package.",
    {
      id: z.number().int().describe("Custom action ID."),
      workPackageId: z.number().int().describe("Work package ID to execute the action on."),
      lockVersion: z.number().int().describe("Lock version of the work package (for optimistic locking)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const result = await client.executeCustomAction(params.id, params.workPackageId, params.lockVersion);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
