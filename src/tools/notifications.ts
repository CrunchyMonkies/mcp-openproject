import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerNotificationTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_notifications",
    "List in-app notifications for the current user.",
    {
      limit: z.number().int().min(1).max(200).optional().describe("Max notifications to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const notifications = await client.listNotifications({ limit: params.limit ?? 50 });
        if (notifications.length === 0) return { content: [{ type: "text", text: "No notifications found." }] };
        return { content: [{ type: "text", text: JSON.stringify(notifications, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_notification",
    "Get details for a single notification by ID.",
    {
      id: z.number().int().describe("Notification ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const notification = await client.getNotification(params.id);
        return { content: [{ type: "text", text: JSON.stringify(notification, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "mark_notification_read",
    "Mark a notification as read.",
    {
      id: z.number().int().describe("Notification ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const notification = await client.markNotificationRead(params.id);
        return { content: [{ type: "text", text: JSON.stringify(notification, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
