import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { OpenProjectClient } from "../client.js";
import { OpenProjectError } from "../errors.js";
import { linkTitle, statusBucket } from "../helpers.js";
import type { Project, WorkPackage } from "../types.js";

function wpLine(wp: WorkPackage): string {
  const id = wp.id || "?";
  const subject = String(wp.subject || "(no subject)");
  const status = linkTitle(wp, "status", "-");
  const assignee = linkTitle(wp, "assignee", "Unassigned");
  return `- #${id} ${subject} (${status}; ${assignee})`;
}

function buildWeeklySummary(project: Project, workPackages: WorkPackage[]): string {
  const completed: WorkPackage[] = [];
  const inProgress: WorkPackage[] = [];
  const blockers: WorkPackage[] = [];

  for (const wp of workPackages) {
    const status = linkTitle(wp, "status", "-");
    const bucket = statusBucket(status);
    if (bucket === "completed") completed.push(wp);
    else if (bucket === "blockers") blockers.push(wp);
    else inProgress.push(wp);
  }

  const projectName = String(project.name || project.identifier || project.id);
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    `# Weekly Status - ${projectName}`,
    `Date: ${today}`,
    "",
    "## Wins / completed",
  ];

  if (completed.length > 0) {
    lines.push(...completed.slice(0, 10).map(wpLine));
  } else {
    lines.push("- No completed items detected in current snapshot.");
  }

  lines.push("", "## In progress");
  if (inProgress.length > 0) {
    lines.push(...inProgress.slice(0, 15).map(wpLine));
  } else {
    lines.push("- No in-progress items detected.");
  }

  lines.push("", "## Blockers / risks");
  if (blockers.length > 0) {
    lines.push(...blockers.slice(0, 10).map(wpLine));
  } else {
    lines.push("- No explicit blockers inferable from current status labels.");
  }

  lines.push("", "## Next focus");
  const focusItems = inProgress.slice(0, 5);
  if (focusItems.length > 0) {
    lines.push(...focusItems.map(wpLine));
  } else {
    lines.push("- Confirm priorities for the next sprint window.");
  }

  return lines.join("\n");
}

function buildDecisionMarkdown(
  dateText: string,
  project: string,
  title: string,
  decision: string,
  context: string,
  impact: string,
  followup: string,
): string {
  return [
    `# Decision: ${title}`,
    "",
    `Date: ${dateText}`,
    `Project: ${project}`,
    "",
    "## Context",
    context.trim() || "(none provided)",
    "",
    "## Decision",
    decision.trim(),
    "",
    "## Impact",
    impact.trim() || "(to be assessed)",
    "",
    "## Follow-up",
    followup.trim() || "(none)",
    "",
  ].join("\n");
}

export function registerKnowledgeTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
  getDefaultProject: () => string | undefined,
): void {
  server.tool(
    "weekly_summary",
    "Generate a compact weekly status summary in markdown, grouped by completion status.",
    {
      project: z.string().optional().describe("Project ID or identifier. Uses OPENPROJECT_DEFAULT_PROJECT if omitted."),
    },
    async (params) => {
      try {
        const client = getClient();
        const projectRef = params.project || getDefaultProject();
        if (!projectRef) {
          throw new OpenProjectError("project is required unless OPENPROJECT_DEFAULT_PROJECT is set.");
        }
        const project = await client.resolveProject(projectRef);
        const wps = await client.listWorkPackages(project.id, { limit: 200 });
        const summary = buildWeeklySummary(project, wps);
        return { content: [{ type: "text", text: summary }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "log_decision",
    "Generate a project decision log entry in markdown format.",
    {
      project: z.string().optional().describe("Project ID or identifier. Uses OPENPROJECT_DEFAULT_PROJECT if omitted."),
      title: z.string().describe("Decision title."),
      decision: z.string().describe("Decision statement."),
      context: z.string().optional().describe("Context notes."),
      impact: z.string().optional().describe("Impact notes."),
      followup: z.string().optional().describe("Follow-up actions."),
    },
    async (params) => {
      try {
        const projectRef = params.project || getDefaultProject();
        if (!projectRef) {
          throw new OpenProjectError("project is required unless OPENPROJECT_DEFAULT_PROJECT is set.");
        }
        const today = new Date().toISOString().slice(0, 10);
        const markdown = buildDecisionMarkdown(
          today,
          projectRef,
          params.title,
          params.decision,
          params.context || "",
          params.impact || "",
          params.followup || "",
        );
        return { content: [{ type: "text", text: markdown }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
