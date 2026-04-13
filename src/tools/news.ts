import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerNewsTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
  getDefaultProject: () => string | undefined,
): void {
  server.tool(
    "list_news",
    "List news items, optionally filtered by project.",
    {
      project: z.string().optional().describe("Project ID or identifier. Uses OPENPROJECT_DEFAULT_PROJECT if omitted."),
      limit: z.number().int().min(1).max(500).optional().describe("Max news items to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const projectRef = params.project || getDefaultProject();
        let projectId: number | undefined;
        if (projectRef) {
          const project = await client.resolveProject(projectRef);
          projectId = project.id;
        }
        const news = await client.listNews({ projectId, limit: params.limit });
        if (news.length === 0) return { content: [{ type: "text", text: "No news found." }] };
        return { content: [{ type: "text", text: JSON.stringify(news, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_news",
    "Get details for a single news item by ID.",
    {
      id: z.number().int().describe("News ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const news = await client.getNews(params.id);
        return { content: [{ type: "text", text: JSON.stringify(news, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_news",
    "Create a news item in a project.",
    {
      title: z.string().describe("News title."),
      project: z.string().optional().describe("Project ID or identifier. Uses OPENPROJECT_DEFAULT_PROJECT if omitted."),
      summary: z.string().optional().describe("News summary."),
      description: z.string().optional().describe("News description (raw text)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const projectRef = params.project || getDefaultProject();
        if (!projectRef) {
          throw new OpenProjectError("project is required unless OPENPROJECT_DEFAULT_PROJECT is set.");
        }
        const project = await client.resolveProject(projectRef);
        const news = await client.createNews({
          title: params.title,
          projectId: project.id!,
          summary: params.summary,
          description: params.description,
        });
        return { content: [{ type: "text", text: JSON.stringify(news, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_news",
    "Update an existing news item.",
    {
      id: z.number().int().describe("News ID."),
      title: z.string().optional().describe("New title."),
      summary: z.string().optional().describe("New summary."),
      description: z.string().optional().describe("New description (raw text)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const news = await client.updateNews(params.id, {
          title: params.title,
          summary: params.summary,
          description: params.description,
        });
        return { content: [{ type: "text", text: JSON.stringify(news, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "delete_news",
    "Delete a news item by ID.",
    {
      id: z.number().int().describe("News ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        await client.deleteNews(params.id);
        return { content: [{ type: "text", text: `Deleted news #${params.id}` }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
