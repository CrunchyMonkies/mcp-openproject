import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerGroupTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_groups",
    "List all groups.",
    {
      limit: z.number().int().min(1).max(500).optional().describe("Max groups to fetch (default: 100)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const groups = await client.listGroups(params.limit);
        if (groups.length === 0) return { content: [{ type: "text", text: "No groups found." }] };
        return { content: [{ type: "text", text: JSON.stringify(groups, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_group",
    "Get details for a single group by ID.",
    {
      id: z.number().int().describe("Group ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const group = await client.getGroup(params.id);
        return { content: [{ type: "text", text: JSON.stringify(group, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_group",
    "Create a new group.",
    {
      name: z.string().describe("Group name."),
      memberIds: z.array(z.number().int()).optional().describe("Array of user IDs to add as members."),
    },
    async (params) => {
      try {
        const client = getClient();
        const group = await client.createGroup({
          name: params.name,
          memberIds: params.memberIds,
        });
        return { content: [{ type: "text", text: JSON.stringify(group, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_group",
    "Update an existing group.",
    {
      id: z.number().int().describe("Group ID."),
      name: z.string().optional().describe("New group name."),
      memberIds: z.array(z.number().int()).optional().describe("New array of member user IDs."),
    },
    async (params) => {
      try {
        const client = getClient();
        const group = await client.updateGroup(params.id, {
          name: params.name,
          memberIds: params.memberIds,
        });
        return { content: [{ type: "text", text: JSON.stringify(group, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_group",
    "Delete a group by ID.",
    {
      id: z.number().int().describe("Group ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteGroup(params.id);
        return { content: [{ type: "text", text: `Deleted group #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
