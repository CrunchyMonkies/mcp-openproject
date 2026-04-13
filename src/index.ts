#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OpenProjectClient } from "./client.js";
import { OpenProjectError } from "./errors.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerWorkPackageTools } from "./tools/work-packages.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerMetadataTools } from "./tools/metadata.js";
import { registerUserTools } from "./tools/users.js";
import { registerRelationTools } from "./tools/relations.js";
import { registerKnowledgeTools } from "./tools/knowledge.js";

const server = new McpServer({
  name: "mcp-openproject",
  version: "0.1.0",
});

function getClient(): OpenProjectClient {
  const baseUrl = process.env.OPENPROJECT_BASE_URL?.trim();
  const apiToken = process.env.OPENPROJECT_API_TOKEN?.trim();
  if (!baseUrl) {
    throw new OpenProjectError("OPENPROJECT_BASE_URL environment variable is required.");
  }
  if (!apiToken) {
    throw new OpenProjectError("OPENPROJECT_API_TOKEN environment variable is required.");
  }
  return new OpenProjectClient({ baseUrl, apiToken });
}

function getDefaultProject(): string | undefined {
  return process.env.OPENPROJECT_DEFAULT_PROJECT?.trim() || undefined;
}

// Register all tools
registerProjectTools(server, getClient);
registerWorkPackageTools(server, getClient, getDefaultProject);
registerCommentTools(server, getClient);
registerMetadataTools(server, getClient, getDefaultProject);
registerUserTools(server, getClient);
registerRelationTools(server, getClient);
registerKnowledgeTools(server, getClient, getDefaultProject);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp-openproject] Server started on stdio");
}

main().catch((err) => {
  console.error("[mcp-openproject] Fatal:", err);
  process.exit(1);
});
