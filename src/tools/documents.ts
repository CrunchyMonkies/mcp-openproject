import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerDocumentTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_documents",
    "List documents, optionally filtered by project.",
    {
      projectId: z.number().int().optional().describe("Filter by project ID."),
      limit: z.number().int().min(1).max(500).optional().describe("Max documents to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const documents = await client.listDocuments({
          projectId: params.projectId,
          limit: params.limit,
        });
        if (documents.length === 0) return { content: [{ type: "text", text: "No documents found." }] };
        return { content: [{ type: "text", text: JSON.stringify(documents, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_document",
    "Get details for a single document by ID.",
    {
      id: z.number().int().describe("Document ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const document = await client.getDocument(params.id);
        return { content: [{ type: "text", text: JSON.stringify(document, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_document",
    "Update an existing document.",
    {
      id: z.number().int().describe("Document ID."),
      title: z.string().optional().describe("New document title."),
      description: z.string().optional().describe("New document description (raw text)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const document = await client.updateDocument(params.id, {
          title: params.title,
          description: params.description,
        });
        return { content: [{ type: "text", text: JSON.stringify(document, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
