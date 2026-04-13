import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client.js";
import { OpenProjectError } from "../errors.js";
import {
  extractFormattableText,
  filterWorkPackages,
  formatDate,
  linkTitle,
  truncate,
  ensureIsoDate,
} from "../helpers.js";
import type { WorkPackage } from "../types.js";

function formatWorkPackageList(workPackages: WorkPackage[], projectLabel?: string): string {
  const lines: string[] = [];
  if (projectLabel) lines.push(`Project: ${projectLabel}`);

  if (workPackages.length === 0) {
    lines.push("No matching work packages found.");
    return lines.join("\n");
  }

  lines.push("WP ID   Subject                              Status         Assignee        Updated");
  lines.push("-----   -----------------------------------  -------------  --------------  ----------");
  for (const wp of workPackages) {
    const id = String(wp.id || "?").padEnd(5);
    const subject = truncate(String(wp.subject || "(no subject)"), 35).padEnd(35);
    const status = truncate(linkTitle(wp, "status", "-"), 13).padEnd(13);
    const assignee = truncate(linkTitle(wp, "assignee", "Unassigned"), 14).padEnd(14);
    const updated = formatDate(String(wp.updatedAt || ""));
    lines.push(`${id}   ${subject}  ${status}  ${assignee}  ${updated}`);
  }
  return lines.join("\n");
}

function formatWorkPackageDetail(wp: WorkPackage): string {
  const lines: string[] = [
    `Work package #${wp.id}`,
    `Subject: ${wp.subject || "(no subject)"}`,
    `Status: ${linkTitle(wp, "status", "-")}`,
    `Type: ${linkTitle(wp, "type", "-")}`,
    `Priority: ${linkTitle(wp, "priority", "-")}`,
    `Assignee: ${linkTitle(wp, "assignee", "Unassigned")}`,
    `Author: ${linkTitle(wp, "author", "-")}`,
    `Start date: ${wp.startDate || "-"}`,
    `Due date: ${wp.dueDate || "-"}`,
    `Created: ${formatDate(String(wp.createdAt || ""))}`,
    `Updated: ${formatDate(String(wp.updatedAt || ""))}`,
    `Lock version: ${wp.lockVersion ?? "-"}`,
  ];

  const description = extractFormattableText(wp.description);
  if (description.trim()) {
    lines.push("", "Description:", "", description.trim());
  }

  return lines.join("\n");
}

export function registerWorkPackageTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
  getDefaultProject: () => string | undefined,
): void {
  server.tool(
    "list_work_packages",
    "List work packages for a project with optional status/assignee filters.",
    {
      project: z.string().optional().describe("Project ID or identifier. Uses OPENPROJECT_DEFAULT_PROJECT if omitted."),
      status: z.string().optional().describe("Status filter (case-insensitive substring match)."),
      assignee: z.string().optional().describe("Assignee filter (case-insensitive substring match)."),
      limit: z.number().int().min(1).max(500).optional().describe("Max work packages to fetch (default: 50)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const projectRef = params.project || getDefaultProject();
        if (!projectRef) {
          throw new OpenProjectError("project is required unless OPENPROJECT_DEFAULT_PROJECT is set.");
        }
        const project = await client.resolveProject(projectRef);
        const wps = await client.listWorkPackages(project.id, {
          limit: params.limit,
          statusFilter: params.status,
          assigneeFilter: params.assignee,
        });
        const filtered = filterWorkPackages(wps, params.status, params.assignee);
        const label = String(project.identifier || project.name || project.id);
        return { content: [{ type: "text", text: formatWorkPackageList(filtered, label) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_work_package",
    "Get full details for a single work package by ID.",
    {
      id: z.number().int().describe("Work package ID."),
    },
    async (params) => {
      try {
        const client = getClient();
        const wp = await client.getWorkPackage(params.id);
        return { content: [{ type: "text", text: formatWorkPackageDetail(wp) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_work_package",
    "Create a new work package in a project.",
    {
      project: z.string().optional().describe("Project ID or identifier. Uses OPENPROJECT_DEFAULT_PROJECT if omitted."),
      subject: z.string().describe("Work package subject/title."),
      type: z.string().optional().describe("Work package type name (default: Task)."),
      description: z.string().optional().describe("Work package description."),
    },
    async (params) => {
      try {
        const client = getClient();
        const projectRef = params.project || getDefaultProject();
        if (!projectRef) {
          throw new OpenProjectError("project is required unless OPENPROJECT_DEFAULT_PROJECT is set.");
        }
        const project = await client.resolveProject(projectRef);
        const created = await client.createWorkPackage(
          project,
          params.subject,
          params.type || "Task",
          params.description,
        );
        return {
          content: [{ type: "text", text: `Created work package #${created.id}: ${created.subject}` }],
        };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_work_package",
    "Update one or more fields on a work package (subject, description, status, assignee, priority, type, dates).",
    {
      id: z.number().int().describe("Work package ID."),
      subject: z.string().optional().describe("New subject/title."),
      description: z.string().optional().describe("New description."),
      status: z.string().optional().describe("New status name (transition-aware, case-insensitive)."),
      assignee: z.string().optional().describe("Assignee user ID, login, or display name."),
      priority: z.string().optional().describe("Priority name."),
      type: z.string().optional().describe("Work package type name."),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)."),
      dueDate: z.string().optional().describe("Due date (YYYY-MM-DD)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const startDate = params.startDate ? ensureIsoDate(params.startDate, "startDate") : undefined;
        const dueDate = params.dueDate ? ensureIsoDate(params.dueDate, "dueDate") : undefined;

        const updated = await client.updateWorkPackage(params.id, {
          subject: params.subject,
          description: params.description,
          statusName: params.status,
          assigneeRef: params.assignee,
          priorityName: params.priority,
          typeName: params.type,
          startDate,
          dueDate,
        });
        return {
          content: [{ type: "text", text: `Updated work package #${updated.id}.\n\n${formatWorkPackageDetail(updated)}` }],
        };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "update_work_package_status",
    "Update only the status of a work package (transition-aware).",
    {
      id: z.number().int().describe("Work package ID."),
      status: z.string().describe("Target status name (case-insensitive)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const updated = await client.updateWorkPackageStatus(params.id, params.status);
        const newStatus = linkTitle(updated, "status", params.status);
        return {
          content: [{ type: "text", text: `Updated work package #${updated.id} to status '${newStatus}'.` }],
        };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
