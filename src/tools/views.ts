import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerViewTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_views",
    "List all views.",
    {
      limit: z.number().int().min(1).max(500).optional().describe("Max views to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const views = await client.listViews({ limit: params.limit });
        if (views.length === 0) return { content: [{ type: "text", text: "No views found." }] };
        return { content: [{ type: "text", text: JSON.stringify(views, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_view",
    "Get details for a single view by ID.",
    {
      id: z.number().int().describe("View ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const view = await client.getView(params.id);
        return { content: [{ type: "text", text: JSON.stringify(view, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_view",
    "Create a new view from a saved query.",
    {
      type: z.string().describe("View type (e.g. 'work_packages_table')."),
      queryId: z.number().int().describe("ID of the query to associate with this view."),
      name: z.string().optional().describe("View name."),
    },
    async (params) => {
      try {
        const client = getClient();
        const view = await client.createView(params.type, {
          queryId: params.queryId,
          name: params.name,
        });
        return { content: [{ type: "text", text: JSON.stringify(view, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_view",
    "Update an existing view.",
    {
      id: z.number().int().describe("View ID."),
      name: z.string().optional().describe("New view name."),
    },
    async (params) => {
      try {
        const client = getClient();
        const view = await client.updateView(params.id, {
          name: params.name,
        });
        return { content: [{ type: "text", text: JSON.stringify(view, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_view",
    "Delete a view by ID.",
    {
      id: z.number().int().describe("View ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteView(params.id);
        return { content: [{ type: "text", text: `Deleted view #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
