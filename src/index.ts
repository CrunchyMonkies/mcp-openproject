#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OpenProjectClient } from "./client/index.js";
import { OpenProjectError } from "./errors.js";
import { isWriteTool, detectModulesFromLinks, DOMAIN_MODULE } from "./modules.js";
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
  version: "1.0.2",
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

async function main() {
  const readOnly = process.env.OPENPROJECT_READ_ONLY?.trim().toLowerCase() === "true";

  // --- Detect available modules from OpenProject API root ---
  let enabledModules: Set<string> | null = null;
  try {
    const client = getClient();
    const root = await client.getServerInfo();
    const links = (root as Record<string, unknown>)?._links;
    if (links && typeof links === "object") {
      enabledModules = detectModulesFromLinks(links as Record<string, unknown>);
      if (enabledModules.size > 0) {
        console.error(`[mcp-openproject] Detected modules: ${[...enabledModules].join(", ")}`);
      } else {
        console.error("[mcp-openproject] No optional modules detected from API root — registering all tools");
        enabledModules = null;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[mcp-openproject] Module detection skipped (${msg}) — registering all tools`);
  }

  function shouldRegisterDomain(domain: string): boolean {
    const module = DOMAIN_MODULE[domain];
    if (!module) return true;
    if (!enabledModules) return true;
    return enabledModules.has(module);
  }

  // --- Read-only mode: intercept server.tool() to skip write tools ---
  const origTool = server.tool.bind(server);
  if (readOnly) {
    const skipped: string[] = [];
    (server as any).tool = (name: string, ...rest: unknown[]) => {
      if (isWriteTool(name)) {
        skipped.push(name);
        return;
      }
      return (origTool as any)(name, ...rest);
    };
    // Log will happen after registration is complete
    process.on("beforeExit", () => {
      if (skipped.length > 0) {
        console.error(`[mcp-openproject] Read-only: skipped ${skipped.length} write tools`);
      }
    });
  }

  // --- Register core tools (always available) ---
  registerProjectTools(server, getClient);
  registerWorkPackageTools(server, getClient, getDefaultProject);
  registerCommentTools(server, getClient);
  registerMetadataTools(server, getClient, getDefaultProject);
  registerUserTools(server, getClient);
  registerRelationTools(server, getClient);
  registerKnowledgeTools(server, getClient, getDefaultProject);
  registerNotificationTools(server, getClient);
  registerAttachmentTools(server, getClient);
  registerGroupTools(server, getClient);
  registerQueryTools(server, getClient);
  registerCustomActionTools(server, getClient);
  registerDayTools(server, getClient);
  registerFileLinkTools(server, getClient);
  registerViewTools(server, getClient);
  registerSchemaTools(server, getClient);
  registerPrincipalTools(server, getClient);
  registerConfigurationTools(server, getClient);

  // --- Register module-dependent tools (conditional) ---
  if (shouldRegisterDomain("time-entries")) registerTimeEntryTools(server, getClient);
  if (shouldRegisterDomain("news")) registerNewsTools(server, getClient, getDefaultProject);
  if (shouldRegisterDomain("documents")) registerDocumentTools(server, getClient);
  if (shouldRegisterDomain("budgets")) registerBudgetTools(server, getClient);
  if (shouldRegisterDomain("versions")) registerVersionTools(server, getClient);
  if (shouldRegisterDomain("activities")) registerActivityTools(server, getClient);
  if (shouldRegisterDomain("memberships")) registerMembershipTools(server, getClient);
  if (shouldRegisterDomain("revisions")) registerRevisionTools(server, getClient);

  // Restore original server.tool after registration
  if (readOnly) {
    (server as any).tool = origTool;
  }

  // --- Start transport ---
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const flags: string[] = [];
  if (readOnly) flags.push("read-only");
  if (enabledModules) flags.push(`${enabledModules.size} modules`);
  const suffix = flags.length > 0 ? ` (${flags.join(", ")})` : "";
  console.error(`[mcp-openproject] Server started on stdio${suffix}`);
}

main().catch((err) => {
  console.error("[mcp-openproject] Fatal:", err);
  process.exit(1);
});
