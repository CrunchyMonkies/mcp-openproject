import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client.js";
import { OpenProjectError } from "../errors.js";
import { filterUsers, truncate, userDisplayName } from "../helpers.js";
import type { User } from "../types.js";

function formatUsers(users: User[]): string {
  if (users.length === 0) return "No users returned.";
  const lines = [
    "ID   Name                              Login",
    "---  --------------------------------  ----------------------",
  ];
  for (const u of users) {
    const id = String(u.id || "?").padEnd(3);
    const name = truncate(userDisplayName(u), 32).padEnd(32);
    const login = truncate(String(u.login || "-"), 22);
    lines.push(`${id}  ${name}  ${login}`);
  }
  return lines.join("\n");
}

export function registerUserTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_users",
    "List visible users with optional name/login filter.",
    {
      query: z.string().optional().describe("Case-insensitive substring filter (name/login/id)."),
      limit: z.number().int().min(1).max(500).optional().describe("Max users to fetch (default: 200)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const users = await client.getUsers(params.limit ?? 200);
        const filtered = filterUsers(users, params.query);
        return { content: [{ type: "text", text: formatUsers(filtered) }] };
      } catch (err) {
        if (err instanceof OpenProjectError && err.statusCode === 403) {
          return {
            content: [{
              type: "text",
              text: "Error: Listing users is forbidden for this token/role. Use an account with user-list permission.",
            }],
            isError: true,
          };
        }
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
