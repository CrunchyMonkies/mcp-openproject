import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
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

  server.tool(
    "get_user",
    "Get details for a single user by ID.",
    {
      id: z.number().int().describe("User ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const user = await client.getUser(params.id);
        return { content: [{ type: "text", text: JSON.stringify(user, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_user",
    "Create a new user account.",
    {
      login: z.string().describe("User login name."),
      email: z.string().describe("User email address."),
      firstName: z.string().describe("First name."),
      lastName: z.string().describe("Last name."),
      password: z.string().optional().describe("Initial password (optional)."),
      admin: z.boolean().optional().describe("Whether the user has admin privileges."),
    },
    async (params) => {
      try {
        const client = getClient();
        const user = await client.createUser({
          login: params.login,
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          password: params.password,
          admin: params.admin,
        });
        return { content: [{ type: "text", text: JSON.stringify(user, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_user",
    "Update fields on an existing user.",
    {
      id: z.number().int().describe("User ID."),
      login: z.string().optional().describe("New login name."),
      email: z.string().optional().describe("New email address."),
      firstName: z.string().optional().describe("New first name."),
      lastName: z.string().optional().describe("New last name."),
      admin: z.boolean().optional().describe("Whether the user has admin privileges."),
    },
    async (params) => {
      try {
        const client = getClient();
        const user = await client.updateUser(params.id, {
          login: params.login,
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          admin: params.admin,
        });
        return { content: [{ type: "text", text: JSON.stringify(user, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_user",
    "Delete a user by ID.",
    {
      id: z.number().int().describe("User ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteUser(params.id);
        return { content: [{ type: "text", text: `Deleted user #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
