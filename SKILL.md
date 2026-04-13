---
name: openproject-mcp
description: Manage OpenProject projects, work packages, statuses, relations, and generate knowledge artifacts (weekly summaries, decision logs) via MCP tools. Use when work requires reading project status, creating or updating work packages, managing relations, adding comments, or generating status reports.
---

# OpenProject MCP Server Skill

Purpose: use OpenProject as project source of truth via MCP tools for project management and knowledge artifact generation.

## Safety Rules

- Never expose API tokens, credentials, or secret values in tool outputs.
- Do not perform delete operations (not supported by this server).
- Fail closed with clear errors when permissions, transitions, or endpoints are not available.
- Treat OpenProject wiki API operations as unsupported.

## Environment Variables

Configure these before starting the MCP server:

- `OPENPROJECT_BASE_URL` (required): OpenProject base URL, e.g. `https://openproject.example.org`.
- `OPENPROJECT_API_TOKEN` (required): API token for authentication.
- `OPENPROJECT_DEFAULT_PROJECT` (optional): Default project ID/identifier used when `project` parameter is omitted.

## MCP Tools Reference

### Project & Metadata Queries

- **`list_projects`** - List visible projects with ID, identifier, and name.
- **`list_statuses`** - List available work package statuses (ID, name, closed flag).
- **`list_types`** `{project?}` - List work package types, optionally scoped to a project.
- **`list_priorities`** - List available priority values.
- **`list_users`** `{query?, limit?}` - List visible users, optionally filtered by name/login.

### Work Package Operations

- **`list_work_packages`** `{project?, status?, assignee?, limit?}` - List work packages with optional status/assignee filters (case-insensitive substring match).
- **`get_work_package`** `{id}` - Get full details for a single work package (status, type, priority, assignee, dates, description).
- **`create_work_package`** `{project?, subject, type?, description?}` - Create a work package. Resolves type by name. Returns created WP ID.
- **`update_work_package`** `{id, subject?, description?, status?, assignee?, priority?, type?, startDate?, dueDate?}` - Update one or more fields. Status changes are transition-aware. Dates must be YYYY-MM-DD.
- **`update_work_package_status`** `{id, status}` - Update only status (transition-aware, case-insensitive name resolution).
- **`add_comment`** `{id, comment}` - Add a comment/note to a work package.

### Relations

- **`list_relations`** `{id, limit?}` - List relations for a work package.
- **`create_relation`** `{fromId, toId, type, description?, lag?}` - Create a relation. Valid types: `relates`, `duplicates`, `duplicated`, `blocks`, `blocked`, `precedes`, `follows`, `includes`, `partof`, `requires`, `required`.

### Knowledge Artifacts

- **`weekly_summary`** `{project?}` - Generate a compact weekly status summary in markdown grouped by: Wins/completed, In progress, Blockers/risks, Next focus.
- **`log_decision`** `{project?, title, decision, context?, impact?, followup?}` - Generate a project decision log entry in markdown format.

## Agent Behavior

### Project status

- Use `list_work_packages` against the project in scope.
- Summarize by status buckets and include key WP IDs in outputs.
- Flag uncertainty explicitly when status labels are ambiguous.

### Creating tasks

- Use `create_work_package` with clear subject and optional description.
- Keep task type explicit when not defaulting to `Task`.
- Return created WP ID for traceability.

### Updating tasks

- Use `update_work_package` for multi-field updates and `update_work_package_status` for status-only changes.
- Status names are resolved case-insensitively and validated against allowed transitions.
- Validate date inputs as `YYYY-MM-DD` before sending updates.
- Confirm updates with WP ID and key resulting fields.

### Metadata and lookup

- Use `list_statuses`, `list_types`, `list_priorities`, and `list_users` before creating/updating when values are uncertain.
- Prefer explicit metadata lookups over guesswork when type/status/priority names vary between OpenProject instances.

### Relations

- Use `list_relations` to inspect dependencies and ordering constraints.
- Use `create_relation` for new links (`relates`, `blocks`, `follows`, etc.) and include `lag` only when needed.

### Weekly status summary

- Use `weekly_summary` to generate a compact markdown report.
- The output includes sections: Wins/completed, In progress, Blockers/risks, Next focus.

### Decision logging

- Use `log_decision` for durable decisions.
- Capture context, decision, impact, and follow-up actions.

## Output Style

- Keep outputs concise and structured.
- Always include work package IDs (e.g., `#123`) when referencing tasks.
- Prefer markdown lists and short sections over long prose.
