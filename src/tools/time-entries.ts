import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { checkProjectModule } from "../modules.js";

export function registerTimeEntryTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_time_entries",
    "List time entries with optional project/work package filters.",
    {
      projectId: z.number().int().optional().describe("Filter by project ID."),
      workPackageId: z.number().int().optional().describe("Filter by work package ID."),
      limit: z.number().int().min(1).max(500).optional().describe("Max entries to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        if (params.projectId) await checkProjectModule(client, params.projectId, "time_tracking", "list_time_entries");
        const entries = await client.listTimeEntries({
          projectId: params.projectId,
          workPackageId: params.workPackageId,
          limit: params.limit ?? 50,
        });
        if (entries.length === 0) return { content: [{ type: "text", text: "No time entries found." }] };
        const lines = [
          "ID   Hours   Spent On    Work Package",
          "---  ------  ----------  ------------",
        ];
        for (const e of entries) {
          const id = String(e.id || "?").padEnd(3);
          const hours = String(e.hours || "-").padEnd(6);
          const spentOn = String(e.spentOn || "-").padEnd(10);
          const wp = (e._links as Record<string, { title?: string }> | undefined)?.workPackage?.title || "-";
          lines.push(`${id}  ${hours}  ${spentOn}  ${wp}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_time_entry",
    "Get details for a single time entry by ID.",
    {
      id: z.number().int().describe("Time entry ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const entry = await client.getTimeEntry(params.id);
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_time_entry",
    "Log a time entry against a work package.",
    {
      hours: z.string().describe("Duration in ISO 8601 format, e.g. PT2H for 2 hours."),
      spentOn: z.string().describe("Date the time was spent (YYYY-MM-DD)."),
      workPackageId: z.number().int().describe("Work package ID to log time against."),
      comment: z.string().optional().describe("Comment for the time entry."),
      activityId: z.number().int().optional().describe("Activity ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const entry = await client.createTimeEntry({
          hours: params.hours,
          spentOn: params.spentOn,
          workPackageId: params.workPackageId,
          comment: params.comment,
          activityId: params.activityId,
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_time_entry",
    "Update an existing time entry.",
    {
      id: z.number().int().describe("Time entry ID."),
      hours: z.string().optional().describe("New duration in ISO 8601 format, e.g. PT2H."),
      spentOn: z.string().optional().describe("New date (YYYY-MM-DD)."),
      comment: z.string().optional().describe("New comment."),
    },
    async (params) => {
      try {
        const client = getClient();
        const entry = await client.updateTimeEntry(params.id, {
          hours: params.hours,
          spentOn: params.spentOn,
          comment: params.comment,
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_time_entry",
    "Delete a time entry by ID.",
    {
      id: z.number().int().describe("Time entry ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteTimeEntry(params.id);
        return { content: [{ type: "text", text: `Deleted time entry #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
