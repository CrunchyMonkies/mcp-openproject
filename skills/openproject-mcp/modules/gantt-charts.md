# Gantt Charts

## Overview
Gantt charts provide a timeline visualization of work packages, showing start/end dates as horizontal bars with dependencies represented as connector lines. OpenProject supports both automatic scheduling (dates calculated from relations) and manual scheduling (user-defined dates). The Gantt view is accessible from the work packages table by enabling the timeline column.

## Key Concepts
- **Scheduling Modes**: Automatic (system derives dates from predecessor/follower relations) vs Manual (user sets dates freely without constraint enforcement)
- **Dependencies**: Predecessor/follower relations shown as blue connector lines between work package bars
- **Milestones**: Zero-duration work packages shown as diamonds on the timeline
- **Phases**: Duration-based bars with clamp indicators at start and end
- **Baseline Comparison**: Overlay a saved baseline to visualize schedule drift over time
- **Non-Working Days**: Days marked as non-working shown with darker background shading
- **Today Marker**: Red dotted vertical line indicating the current date

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_work_packages` — retrieve work packages with date fields for timeline display; filter by date range
- `create_relation` — create predecessor/follower dependencies between work packages to establish Gantt links

## Common Operations

### Retrieve Work Packages for Timeline Display
1. Use `list_work_packages` with `project_id` and filters for `start_date` and `due_date` not null
2. Include fields `start_date`, `due_date`, `subject`, `type`, `status` in the response
3. Use the date fields to reconstruct timeline positioning in a client application

### Create a Dependency Between Work Packages
1. Use `create_relation` with `from_id` (predecessor) and `to_id` (follower)
2. Set `relation_type` to `precedes` (A must finish before B starts) or `follows`
3. In automatic scheduling mode, OpenProject recalculates dependent dates automatically

### Schedule a Milestone
1. Use `create_work_package` with a milestone type and the same `start_date` and `due_date`
2. Milestones render as diamonds in the Gantt view
3. Use predecessor relations to link milestones to the work packages they depend on

### Adjust Schedule Dates
1. Use `update_work_package` with updated `start_date` and/or `due_date`
2. In automatic scheduling mode, follower work packages shift automatically
3. In manual mode, only the target work package dates change

## Configuration
- Gantt/timeline view is available in all projects with the Work Packages module enabled
- Enable the timeline by toggling the Gantt chart button in the work packages table toolbar
- Multi-project Gantt: use a cross-project work packages query without a project scope
- PDF export of Gantt charts requires the Enterprise edition
- Zoom levels (days, weeks, months) are controlled via the timeline toolbar in the UI
- Label configuration (left label, right label, far-right label) is set per saved query

## Related Modules
- **Work Packages** — Gantt is a view mode of work packages; all WP attributes apply
- **Versions** — version dates can anchor milestones on the Gantt timeline
- **Calendars** — alternative date-based view for shorter-horizon planning
- **Team Planner** — assignee-centric calendar view complementing the Gantt schedule view
