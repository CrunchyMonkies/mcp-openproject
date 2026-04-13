#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OpenProjectClient } from "./client/index.js";
import { OpenProjectError } from "./errors.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerWorkPackageTools } from "./tools/work-packages.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerMetadataTools } from "./tools/metadata.js";
import { registerUserTools } from "./tools/users.js";
import { registerRelationTools } from "./tools/relations.js";
import { registerKnowledgeTools } from "./tools/knowledge.js";
import { registerTimeEntryTools } from "./tools/time-entries.js";
import { registerVersionTools } from "./tools/versions.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerNotificationTools } from "./tools/notifications.js";
import { registerAttachmentTools } from "./tools/attachments.js";
import { registerMembershipTools } from "./tools/memberships.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerNewsTools } from "./tools/news.js";
import { registerQueryTools } from "./tools/queries.js";
import { registerDocumentTools } from "./tools/documents.js";
import { registerCustomActionTools } from "./tools/custom-actions.js";
import { registerDayTools } from "./tools/days.js";
import { registerFileLinkTools } from "./tools/file-links.js";
import { registerViewTools } from "./tools/views.js";
import { registerSchemaTools } from "./tools/schemas-tools.js";
import { registerBudgetTools } from "./tools/budgets.js";
import { registerRevisionTools } from "./tools/revisions.js";
import { registerPrincipalTools } from "./tools/principals.js";
import { registerConfigurationTools } from "./tools/configuration.js";

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
registerTimeEntryTools(server, getClient);
registerVersionTools(server, getClient);
registerActivityTools(server, getClient);
registerNotificationTools(server, getClient);
registerAttachmentTools(server, getClient);
registerMembershipTools(server, getClient);
registerGroupTools(server, getClient);
registerNewsTools(server, getClient, getDefaultProject);
registerQueryTools(server, getClient);
registerDocumentTools(server, getClient);
registerCustomActionTools(server, getClient);
registerDayTools(server, getClient);
registerFileLinkTools(server, getClient);
registerViewTools(server, getClient);
registerSchemaTools(server, getClient);
registerBudgetTools(server, getClient);
registerRevisionTools(server, getClient);
registerPrincipalTools(server, getClient);
registerConfigurationTools(server, getClient);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp-openproject] Server started on stdio");
}

main().catch((err) => {
  console.error("[mcp-openproject] Fatal:", err);
  process.exit(1);
});
