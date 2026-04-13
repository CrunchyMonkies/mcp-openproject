import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { formatDate, truncate } from "../helpers.js";

export function registerActivityTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_activities",
    "List activity journal entries for a work package.",
    {
      workPackageId: z.number().int().describe("Work package ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const activities = await client.listActivities(params.workPackageId);
        if (activities.length === 0) return { content: [{ type: "text", text: "No activities found." }] };
        const lines = activities.map((a) => {
          const id = String(a.id || "?");
          const comment = truncate(String((a.comment as { raw?: string } | undefined)?.raw || "-"), 60);
          const createdAt = formatDate(String(a.createdAt || ""));
          return `#${id}  ${createdAt}  ${comment}`;
        });
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_activity",
    "Get details for a single activity by ID.",
    {
      id: z.number().int().describe("Activity ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const activity = await client.getActivity(params.id);
        return { content: [{ type: "text", text: JSON.stringify(activity, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
