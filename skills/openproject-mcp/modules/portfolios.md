# Portfolios

## Overview
The Portfolios module provides a multi-project overview for strategic visibility across an organization's project landscape. It enables program and portfolio managers to monitor project statuses, track progress, and make resourcing decisions without navigating into individual projects.

## Key Concepts
- **Portfolio**: A cross-project view aggregating multiple projects for high-level oversight
- **Project Status**: Each project's health indicator (On Track, At Risk, Off Track, Not Started, Finished) visible at a glance
- **Portfolio Dashboard**: Configurable overview showing project attributes, statuses, and progress across the portfolio
- **Strategic Visibility**: Allows executives and program managers to see progress across all projects without project-level access to each one
- **Custom Project Attributes**: Project-level custom fields (e.g., Strategic Priority, Business Unit, Executive Sponsor) surfaced in the portfolio view

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_projects` — retrieve all accessible projects with their metadata, status, and custom field values for portfolio aggregation
- `get_project` — fetch detailed information about a single project including description, status, and custom attributes

## Common Operations

### Retrieve All Projects for Portfolio Overview
1. Use `list_projects` to fetch all projects the current user has access to
2. The response includes project name, identifier, status, creation date, and custom field values
3. Filter by `status` or custom field values to focus on active or at-risk projects

### Get Project Status Across Portfolio
1. Use `list_projects` and inspect the `status` field for each project (On Track, At Risk, Off Track, etc.)
2. Group projects by status to generate a portfolio health summary
3. Identify projects marked At Risk or Off Track for escalation

### Get Details of a Specific Portfolio Project
1. Use `get_project` with `project_id` to retrieve full project details
2. The response includes the project description, custom attributes, parent project (for hierarchies), and active modules
3. Use custom field values (e.g., Strategic Priority, Business Unit) for portfolio segmentation

### Build a Project Hierarchy View
1. Use `list_projects` and inspect the `parent` field to identify parent/child project relationships
2. Reconstruct the hierarchy tree to display program and subproject relationships
3. Use this to show roll-up status from subprojects to parent programs

## Configuration
- Portfolio visibility is based on the current user's access permissions across projects
- Project status custom fields are configured via Administration > Custom Fields > Projects
- No separate module activation is required; portfolio views are built from the project list API
- Enterprise edition adds dedicated portfolio dashboard features and project life cycle tracking

## Related Modules
- **Project Overview** — individual project dashboard; Portfolios aggregates across multiple project overviews
- **Work Packages** — cross-project work package queries complement the portfolio project view
- **Members** — portfolio managers need viewer access across all projects in the portfolio
- **Versions** — version/release progress per project contributes to portfolio-level delivery tracking
