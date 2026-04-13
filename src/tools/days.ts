import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerDayTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_days",
    "List working days within a date range.",
    {
      from: z.string().describe("Start date in YYYY-MM-DD format."),
      to: z.string().describe("End date in YYYY-MM-DD format."),
    },
    async (params) => {
      try {
        const client = getClient();
        const days = await client.listDays(params.from, params.to);
        if (days.length === 0) return { content: [{ type: "text", text: "No days found." }] };
        return { content: [{ type: "text", text: JSON.stringify(days, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_week_days",
    "List the configured week days (working/non-working status for each day of the week).",
    {},
    async () => {
      try {
        const client = getClient();
        const weekDays = await client.listWeekDays();
        return { content: [{ type: "text", text: JSON.stringify(weekDays, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "list_non_working_days",
    "List all configured non-working days (holidays, etc.).",
    {},
    async () => {
      try {
        const client = getClient();
        const nonWorkingDays = await client.listNonWorkingDays();
        return { content: [{ type: "text", text: JSON.stringify(nonWorkingDays, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
