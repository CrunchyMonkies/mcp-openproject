# Project Overview

## Overview
The Project Overview provides a configurable dashboard for each project, displaying key information through a widget-based layout. Project managers can arrange widgets to surface the most relevant data — work package tables, Gantt charts, member lists, news, project descriptions, and custom attributes — giving stakeholders a single-pane view of project health.

## Key Concepts
- **Widgets**: Configurable display blocks added to the overview dashboard (work package table, Gantt chart, project description, members, news, custom fields, etc.)
- **Project Attributes**: Custom fields defined at the project level (e.g., Project Status, Budget Reference, Executive Sponsor) displayed in the overview
- **Project Life Cycle**: Phases and milestones defined for the project, visualized on the overview (Enterprise)
- **Layout**: Drag-and-drop widget positioning; each project has its own overview layout
- **Project Description**: Free-text project description with Markdown support, displayed as a widget

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `get_project` — retrieve project details including name, description, status, custom fields, and metadata
- `list_work_packages` — retrieve work packages to populate the work package table widget data programmatically
- `list_versions` — retrieve project versions/milestones to show roadmap progress on the overview

## Common Operations

### Retrieve Project Details
1. Use `get_project` with `project_id` to fetch the project's name, description, status, and custom field values
2. The response includes project identifier, creation date, and any configured project-level custom attributes
3. Use this to build a project summary or status report

### Get Work Packages for Overview Widget
1. Use `list_work_packages` with `project_id` and relevant filters (e.g., open items, high priority, due soon)
2. Display the filtered results as a table widget showing key attributes (subject, status, assignee, due date)

### Get Version/Milestone Summary for Roadmap Widget
1. Use `list_versions` with `project_id` to retrieve all versions with their dates and status
2. Calculate completion percentage by comparing closed vs total work packages per version
3. Display as a roadmap progress summary

## Configuration
- Project Overview is available for all projects; no separate module activation required
- Widgets are added and arranged via the "+" button in the project overview (requires project edit permissions)
- Project-level custom fields are configured via Administration > Custom Fields > Projects, then enabled per project
- Project Life Cycle phases require the Enterprise edition

## Related Modules
- **Work Packages** — work package table and Gantt widgets display project work packages
- **Members** — members widget shows current project team
- **News** — news widget surfaces recent project announcements
- **Versions** — roadmap/version progress can be displayed on the overview
- **Budgets** — budget widgets display planned vs actual spending on the overview
