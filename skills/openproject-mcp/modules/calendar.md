# Calendar

## Overview
The Calendar module provides a visual date-based view of work packages that have start or due dates, offering an intuitive way to see what is scheduled across a project within a given month. It complements the Gantt chart for short-horizon date management and supports filtering to focus on specific types of work.

## Key Concepts
- **Calendar View**: Monthly grid displaying work packages on their start and/or due dates as colored chips
- **Work Package Display**: Each chip shows the work package subject; click to open the split-screen details pane
- **Filters**: Narrow displayed work packages by project, type, status, assignee, or other attributes
- **Non-Working Days**: Days configured as non-working are visually distinguished in the calendar grid
- **Week Days**: Working day configuration determines which days are highlighted as standard working days

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_work_packages` — retrieve work packages with date filters to populate a calendar view; filter by `start_date` and `due_date` ranges
- `list_days` — retrieve a list of days with their working-day status for a given date range
- `list_week_days` — retrieve the configured working weekdays (e.g., Monday–Friday) for the instance
- `list_non_working_days` — retrieve specific non-working days (public holidays, custom closures) configured for the instance

## Common Operations

### Retrieve Work Packages for a Calendar Month
1. Use `list_work_packages` with date filters: `start_date` >= first day of month and `due_date` <= last day of month (or use an OR filter to catch WPs that span the month)
2. Include fields `start_date`, `due_date`, `subject`, `type`, `status`, `assignee` in the response
3. Place each work package on its start date and/or due date in the calendar grid

### Get Working Day Configuration
1. Use `list_week_days` to retrieve which days of the week are configured as working days
2. Use `list_non_working_days` with a date range to get specific holiday or closure dates
3. Use `list_days` for a combined view of working status for each day in a range

### Filter Calendar by Assignee
1. Use `list_work_packages` with an `assignee_id` filter to retrieve only work packages for a specific person
2. Display the filtered results on the calendar to see that person's schedule

### Filter Calendar by Type
1. Use `list_work_packages` with a `type_id` filter (e.g., only Milestones)
2. Display the filtered results to show a milestone-only calendar view

## Configuration
- Calendar module must be enabled per project in Project Settings > Modules
- Non-working days are configured globally via Administration > Working Days
- Filters applied to the calendar view are saved per user as part of the query configuration
- The calendar view is accessible from the project sidebar under Calendar

## Related Modules
- **Work Packages** — calendar displays work packages; all WP attributes apply
- **Gantt Charts** — Gantt provides a horizontal timeline view; Calendar provides a monthly grid view
- **Team Planner** — Team Planner shows assignee rows with work packages; Calendar shows a date grid without assignee rows
- **Meetings** — meeting dates can complement the calendar but are managed in the Meetings module
