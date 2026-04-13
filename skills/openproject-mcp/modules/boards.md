# Boards

## Overview
Boards provide a Kanban-style card view of work packages organized into columns. Basic boards use custom-named lists with no automatic updates when cards are moved, while Action boards (Enterprise) map columns to work package attribute values and automatically update the attribute when a card is dragged between columns.

## Key Concepts
- **Basic Boards**: Free-form columns with custom names; moving a card does not change work package attributes
- **Action Boards** (Enterprise): Columns represent attribute values (status, assignee, version, subproject, parent); moving a card automatically updates the corresponding attribute on the work package
- **Board Types**:
  - **Status/Kanban**: Columns = workflow statuses; moving cards updates work package status
  - **Assignee**: Columns = team members; moving cards reassigns the work package
  - **Version**: Columns = versions/sprints; moving cards changes the target version
  - **Subproject**: Columns = subprojects; moving cards moves the WP to a different subproject
  - **Parent-Child**: Columns = parent work packages; moving cards sets the parent
- **Cards**: Each card displays key work package info; click to open split-screen details pane
- **Filters**: Board-level filters narrow which work packages appear as cards

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_work_packages` — retrieve work packages to populate board columns; filter by status, assignee, version, etc.
- `update_work_package` — update work package attributes (assignee, version, parent) programmatically, equivalent to moving a card on an action board
- `update_work_package_status` — change work package status, equivalent to moving a card on a status/Kanban board

## Common Operations

### Simulate Moving a Card on a Status Board
1. Use `get_work_package` to retrieve the current work package and its allowed status transitions
2. Use `update_work_package_status` with the target `status_id` corresponding to the destination column
3. The work package now appears in the new column when the board refreshes

### Simulate Moving a Card on an Assignee Board
1. Use `update_work_package` with `assignee_id` set to the user representing the destination column
2. The work package moves to the new assignee's column on the board

### Simulate Moving a Card on a Version Board
1. Use `update_work_package` with `version_id` set to the target version's ID
2. The work package moves to the corresponding version column

### Populate a Board View Programmatically
1. Use `list_work_packages` with appropriate filters (e.g., filter by `status` for each column)
2. Group results by the board's column attribute to construct the column layout
3. Display each group as a board column with its work packages as cards

## Configuration
- Boards module must be enabled per project in Project Settings > Modules
- Basic boards are available in all editions; Action boards require Enterprise edition
- Create boards via the Boards section in the project sidebar
- Multiple boards per project are supported for different workflows or teams

## Related Modules
- **Work Packages** — boards are a view of work packages; all WP attributes and types apply
- **Backlogs** — Scrum-specific board (taskboard) for sprint work; boards offer a more general Kanban view
- **Versions** — version-type action boards use versions as column definitions
- **Members** — assignee-type action boards use project members as column definitions
