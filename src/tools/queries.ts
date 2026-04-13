import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerQueryTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_queries",
    "List all saved queries.",
    {
      limit: z.number().int().min(1).max(500).optional().describe("Max queries to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const queries = await client.listQueries({ limit: params.limit });
        if (queries.length === 0) return { content: [{ type: "text", text: "No queries found." }] };
        return { content: [{ type: "text", text: JSON.stringify(queries, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_query",
    "Get details for a single query by ID.",
    {
      id: z.number().int().describe("Query ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const query = await client.getQuery(params.id);
        return { content: [{ type: "text", text: JSON.stringify(query, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_query",
    "Create a new saved query.",
    {
      name: z.string().describe("Query name."),
      projectId: z.number().int().optional().describe("Project ID to scope the query."),
      public: z.boolean().optional().describe("Whether the query is publicly visible."),
    },
    async (params) => {
      try {
        const client = getClient();
        const query = await client.createQuery({
          name: params.name,
          projectId: params.projectId,
          public: params.public,
        });
        return { content: [{ type: "text", text: JSON.stringify(query, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_query",
    "Update an existing saved query.",
    {
      id: z.number().int().describe("Query ID."),
      name: z.string().optional().describe("New query name."),
      public: z.boolean().optional().describe("Whether the query is publicly visible."),
    },
    async (params) => {
      try {
        const client = getClient();
        const query = await client.updateQuery(params.id, {
          name: params.name,
          public: params.public,
        });
        return { content: [{ type: "text", text: JSON.stringify(query, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_query",
    "Delete a saved query by ID.",
    {
      id: z.number().int().describe("Query ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteQuery(params.id);
        return { content: [{ type: "text", text: `Deleted query #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
