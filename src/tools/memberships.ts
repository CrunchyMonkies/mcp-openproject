import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";
import { checkProjectModule } from "../modules.js";

export function registerMembershipTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_memberships",
    "List memberships, optionally filtered by project.",
    {
      projectId: z.number().int().optional().describe("Filter by project ID."),
      limit: z.number().int().min(1).max(500).optional().describe("Max memberships to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        if (params.projectId) await checkProjectModule(client, params.projectId, "members", "list_memberships");
        const memberships = await client.listMemberships({
          projectId: params.projectId,
          limit: params.limit,
        });
        if (memberships.length === 0) return { content: [{ type: "text", text: "No memberships found." }] };
        return { content: [{ type: "text", text: JSON.stringify(memberships, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_membership",
    "Get details for a single membership by ID.",
    {
      id: z.number().int().describe("Membership ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const membership = await client.getMembership(params.id);
        return { content: [{ type: "text", text: JSON.stringify(membership, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_membership",
    "Create a new membership for a principal in a project.",
    {
      projectId: z.number().int().describe("Project ID."),
      principalId: z.number().int().describe("Principal (user/group) ID."),
      roleIds: z.array(z.number().int()).describe("Array of role IDs to assign."),
    },
    async (params) => {
      try {
        const client = getClient();
        await checkProjectModule(client, params.projectId, "members", "create_membership");
        const membership = await client.createMembership({
          projectId: params.projectId,
          principalId: params.principalId,
          roleIds: params.roleIds,
        });
        return { content: [{ type: "text", text: JSON.stringify(membership, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_membership",
    "Update roles for an existing membership.",
    {
      id: z.number().int().describe("Membership ID."),
      roleIds: z.array(z.number().int()).describe("New array of role IDs."),
    },
    async (params) => {
      try {
        const client = getClient();
        const membership = await client.updateMembership(params.id, {
          roleIds: params.roleIds,
        });
        return { content: [{ type: "text", text: JSON.stringify(membership, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_membership",
    "Delete a membership by ID.",
    {
      id: z.number().int().describe("Membership ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteMembership(params.id);
        return { content: [{ type: "text", text: `Deleted membership #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
