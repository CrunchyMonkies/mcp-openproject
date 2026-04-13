---
name: openproject-mcp
description: >
  Use this skill when the user needs to manage projects, work packages, sprints,
  time tracking, or any project management task in OpenProject — including
  creating or updating tasks, checking project status, managing backlogs,
  logging time, generating status reports, or working with Gantt charts and
  boards. Activate even if the user doesn't explicitly mention "OpenProject"
  but refers to work packages, sprint planning, scrum ceremonies, or project
  tracking that maps to an OpenProject instance.
license: MIT
compatibility: Requires Node.js 18+ and an OpenProject instance with API v3 access
metadata:
  author: CrunchyMonkies
  version: "1.0.0"
---

# OpenProject MCP Server Skill

84 tools across 26 resource domains for full OpenProject API v3 coverage.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENPROJECT_BASE_URL` | Yes | OpenProject base URL |
| `OPENPROJECT_API_TOKEN` | Yes | API token for authentication |
| `OPENPROJECT_DEFAULT_PROJECT` | No | Default project ID/identifier when `project` param is omitted |
| `OPENPROJECT_READ_ONLY` | No | Set to `true` to disable all write tools (create, update, delete) |

## Startup Behavior

On startup, the server:

1. **Detects enabled modules** by querying the OpenProject API root. Tools for disabled modules (time tracking, news, documents, budgets, versions, memberships, revisions, activities) are not registered. If detection fails, all tools are registered as a fallback.
2. **Applies read-only mode** when `OPENPROJECT_READ_ONLY=true`. All write tools (`create_*`, `update_*`, `delete_*`, `add_comment`, `execute_custom_action`, `mark_notification_read`) are skipped during registration.

When a tool is called for a specific project, the server also checks whether the required module is enabled for that project. If disabled, the tool returns a clear error indicating which module needs to be enabled in OpenProject project settings.

## Core Tools (Quick Reference)

The most commonly used tools. For the complete 84-tool index, see [references/tool-index.md](references/tool-index.md).

**Work packages**: `list_work_packages`, `get_work_package`, `create_work_package`, `update_work_package`, `update_work_package_status`, `delete_work_package`, `add_comment`

**Projects**: `list_projects`, `get_project`, `create_project`, `update_project`

**Time tracking**: `list_time_entries`, `create_time_entry`, `update_time_entry`

**Metadata lookups**: `list_statuses`, `list_types`, `list_priorities`, `list_users`, `list_roles`, `list_categories`

**Relations**: `list_relations`, `create_relation` — types: `relates`, `duplicates`, `blocks`, `precedes`, `follows`, `includes`, `partof`, `requires`

**Knowledge artifacts**: `weekly_summary`, `log_decision`

## Agent Behavior

### Before creating or updating

Look up metadata first when values are uncertain. Status names, type names, and priority names vary between OpenProject instances.

1. Call `list_statuses`, `list_types`, or `list_priorities` to discover valid values
2. Call `list_users` to resolve assignee names to IDs
3. Use the exact names returned — do not guess

### Status changes

Use `update_work_package_status` for status-only changes. Status changes are **transition-aware** — the API rejects transitions that aren't allowed from the current status. If a status update fails, call `get_work_package` to check the current status and its allowed transitions.

### Creating work packages

1. Use `create_work_package` with a clear subject
2. Set type explicitly when the default `Task` is not appropriate (call `list_types` first)
3. After creation, report the returned work package ID for traceability

### Updating work packages

1. Use `update_work_package` for multi-field updates
2. Dates must be `YYYY-MM-DD` format — any other format will be rejected
3. After updating, verify with `get_work_package` to confirm changes applied

### Project status checks

1. Call `list_work_packages` filtered by project
2. Summarize by status buckets and include work package IDs (e.g., `#123`)
3. Flag uncertainty explicitly when status labels are ambiguous

### Weekly summaries and decisions

- Use `weekly_summary` to generate markdown grouped by: Wins/completed, In progress, Blockers/risks, Next focus
- Use `log_decision` for durable decisions — always include context, decision, impact, and follow-up actions

## Gotchas

- **Status transitions are enforced.** You cannot set an arbitrary status — only transitions allowed from the current status work. Always check `get_work_package` if a status update fails to see what transitions are available.
- **Date format is strict.** `startDate` and `dueDate` must be `YYYY-MM-DD`. ISO 8601 datetime strings, relative dates, or other formats are rejected silently or with an opaque error.
- **Assignee requires a user ID, not a name.** Call `list_users` to resolve display names or logins to numeric IDs before assigning.
- **`list_work_packages` returns paginated results.** Default limit may not include all work packages. Use the `limit` parameter to request more, or make multiple calls if needed.
- **Type names are instance-specific.** One OpenProject instance might use `Bug`, another `Defect`. Never hardcode type names — always call `list_types` first.
- **`update_work_package` requires the current lock version.** The tool handles this internally, but rapid sequential updates to the same work package can fail with a conflict. Re-fetch with `get_work_package` and retry.
- **`weekly_summary` scopes to the last 7 days.** It uses recently-changed work packages, not all work packages. For a full project overview, use `list_work_packages` instead.
- **Module availability is per-project.** A module enabled server-wide may be disabled for a specific project. The server checks project-level module status and returns a clear error if the required module is disabled. Enable modules in OpenProject under Project Settings > Modules.

## Output Style

- Always include work package IDs (e.g., `#123`) when referencing tasks
- Prefer markdown lists and short sections over prose
- When reporting status, group by status category (done, in progress, blocked)

---

## Module Reference

Detailed module documentation in `modules/`. Read the relevant file when you need parameter details or response shapes for a specific domain.

| Module | Description |
|--------|-------------|
| [modules/work-packages.md](modules/work-packages.md) | Core WP lifecycle, types, custom fields, attributes |
| [modules/time-tracking.md](modules/time-tracking.md) | Time logging, activity types, effort vs estimates |
| [modules/members.md](modules/members.md) | Project access, roles, groups, user status |
| [modules/versions.md](modules/versions.md) | Release/sprint planning, roadmap view, progress bars |
| [modules/gantt-charts.md](modules/gantt-charts.md) | Timeline visualization, dependencies, scheduling |
| [modules/boards.md](modules/boards.md) | Kanban-style card views, basic and action boards |
| [modules/backlogs.md](modules/backlogs.md) | Scrum backlogs, sprint planning, story points |
| [modules/notifications.md](modules/notifications.md) | In-app alerts, notification center, read state |
| [modules/activity.md](modules/activity.md) | Audit trail of changes, comments, mentions |
| [modules/budgets.md](modules/budgets.md) | Budget vs actual tracking |
| [modules/calendar.md](modules/calendar.md) | Date-based visual view of scheduled work |
| [modules/cost-tracking.md](modules/cost-tracking.md) | Unit cost entries linked to work packages |
| [modules/documents.md](modules/documents.md) | Document upload and categorization |
| [modules/file-storage.md](modules/file-storage.md) | Attachments and cloud storage integrations |
| [modules/forums.md](modules/forums.md) | Threaded project discussions |
| [modules/meetings.md](modules/meetings.md) | Meeting planning, agendas, action items |
| [modules/news.md](modules/news.md) | Project announcements |
| [modules/portfolios.md](modules/portfolios.md) | Multi-project overview for program managers |
| [modules/project-overview.md](modules/project-overview.md) | Dashboard with widget-based layout |
| [modules/repository.md](modules/repository.md) | Git/SVN integration, commit-to-WP links |
| [modules/team-planner.md](modules/team-planner.md) | Calendar-based resource planning (Enterprise) |
| [modules/wiki.md](modules/wiki.md) | Collaborative documentation, hierarchical pages |

## Workflow Guides

Step-by-step workflow guides in `workflows/`. Read when approaching a multi-tool scenario.

| Workflow | When to read |
|----------|-------------|
| [workflows/sprint-planning.md](workflows/sprint-planning.md) | Setting up a scrum sprint with backlog and assignments |
| [workflows/agile-workflow.md](workflows/agile-workflow.md) | Flow-based Kanban delivery without fixed sprints |
| [workflows/project-setup.md](workflows/project-setup.md) | Initializing a new project with team and backlog |
| [workflows/stakeholder-reporting.md](workflows/stakeholder-reporting.md) | Progress reports for sponsors or management |
| [workflows/release-management.md](workflows/release-management.md) | Release scoping through delivery coordination |
| [workflows/time-and-cost-reporting.md](workflows/time-and-cost-reporting.md) | Budget visibility and overrun detection |
| [workflows/team-workload-management.md](workflows/team-workload-management.md) | Workload balancing and over-allocation detection |
| [workflows/issue-tracking-lifecycle.md](workflows/issue-tracking-lifecycle.md) | Bug from creation through triage to resolution |
| [workflows/test-management.md](workflows/test-management.md) | Test cases and execution cycles |
| [workflows/meeting-management.md](workflows/meeting-management.md) | Meeting action items and follow-up tracking |
| [workflows/okr-management.md](workflows/okr-management.md) | Quarterly OKRs with linked delivery work |
| [workflows/document-collaboration.md](workflows/document-collaboration.md) | Documentation management and review |
| [workflows/portfolio-management.md](workflows/portfolio-management.md) | Cross-project visibility for program managers |
| [workflows/safe-framework.md](workflows/safe-framework.md) | Scaled Agile for multi-team programs |
| [workflows/pm2-pmflex.md](workflows/pm2-pmflex.md) | EU public sector PM2/PMflex methodology |
| [workflows/waterfall-workflow.md](workflows/waterfall-workflow.md) | Sequential phases, milestones, baseline tracking |
