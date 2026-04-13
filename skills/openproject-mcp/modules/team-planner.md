# Team Planner

## Overview
Team Planner is an Enterprise feature providing a calendar-based view with one row per assignee, enabling visual resource planning across a team. Work packages appear as horizontal bars spanning their scheduled dates, and can be rescheduled (horizontal drag), reassigned (vertical drag), or resized (edge drag) directly in the UI.

## Key Concepts
- **Assignee Rows**: Each team member appears as a dedicated row; work packages display in the row of their current assignee
- **View Ranges**: Configurable views — Work Week, 1 Week, 2 Weeks, 4 Weeks, 8 Weeks — to control planning horizon
- **Horizontal Drag**: Move a work package bar left or right to reschedule start and end dates
- **Vertical Drag**: Move a work package bar to a different assignee row to reassign it
- **Edge Handles**: Drag the left or right edge of a bar to resize (change start or end date independently)
- **Remove Drop Zone**: A dedicated zone at the bottom; dropping a work package here clears its assignee and dates
- **Create New WPs**: Click an empty cell in an assignee row to create a new work package pre-assigned to that user on that date
- **Add Existing WPs**: Search for existing work packages and add them to the planner view
- **Private/Public/Favorited Views**: Save planner configurations as private (personal) or public (shared) views

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_work_packages` — retrieve work packages with assignee and date fields to populate the planner; filter by assignee or date range
- `create_work_package` — create a new work package pre-assigned to a user with specific dates
- `update_work_package` — update assignee, start date, or due date to reflect rescheduling or reassignment actions

## Common Operations

### Retrieve Work Packages for Team Planner Display
1. Use `list_work_packages` with `project_id` and filters for `start_date` and `due_date` within the planning horizon
2. Group results by `assignee_id` to construct the row-per-assignee layout
3. Display each work package as a bar spanning from `start_date` to `due_date` in the assignee's row

### Reassign a Work Package
1. Use `update_work_package` with `work_package_id` and `assignee_id` set to the new assignee's user ID
2. Optionally update `start_date` and `due_date` if rescheduling at the same time

### Reschedule a Work Package
1. Use `update_work_package` with `work_package_id` and updated `start_date` and/or `due_date`
2. The work package bar moves to the new date range in the planner view

### Create a Work Package from a Planner Cell
1. Use `create_work_package` with `project_id`, `assignee_id`, `start_date`, `due_date`, and `subject`
2. The new work package appears in the correct row and date position in the planner

### Clear Assignee and Dates (Remove from Planner)
1. Use `update_work_package` with `assignee_id` set to null and `start_date`/`due_date` cleared
2. The work package is removed from the planner view but still exists as an unscheduled work package

## Configuration
- Team Planner requires the Enterprise edition
- The Work Packages module must be active in the project
- Accessible from the project sidebar under Team Planner
- Multiple named planner views can be saved per project (private or public)
- Filter support allows narrowing displayed work packages by type, status, or other attributes

## Related Modules
- **Work Packages** — Team Planner is a specialized view of work packages with assignee and date focus
- **Members** — assignee rows are populated from project members
- **Calendar** — Calendar shows a date grid without assignee rows; Team Planner adds the resource dimension
- **Gantt Charts** — Gantt shows dependency-aware timeline; Team Planner focuses on resource allocation
