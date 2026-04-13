# Time Tracking

## Overview
Time Tracking allows team members to log hours spent on work packages, providing visibility into actual effort versus estimates. Time entries include duration, date, activity type, and optional comments. A centralized "My time tracking" view consolidates all time logged by the current user across projects.

## Key Concepts
- **Time Entry**: A record of hours logged against a specific work package, including date, duration, activity, and optional comment
- **Duration Format**: ISO 8601 duration strings (e.g., `PT2H` for 2 hours, `PT1H30M` for 1.5 hours)
- **Activity**: Category of work performed (e.g., Development, Design, Testing, Management) — configurable via Administration
- **My Time Tracking**: Centralized view showing all time entries by the current user across all projects
- **Time Reports**: Filterable and groupable reports aggregating time entries by user, project, work package, activity, or date range
- **Third-Party Integrations**: Toggl, TimeCamp, and Time Tracker can sync time entries into OpenProject

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_time_entries` — retrieve time entries with filters for project, work package, user, or date range
- `get_time_entry` — fetch details of a single time entry by ID
- `create_time_entry` — log a new time entry against a work package
- `update_time_entry` — modify an existing time entry's hours, date, activity, or comment
- `delete_time_entry` — remove a time entry permanently

## Common Operations

### Log Time Against a Work Package
1. Use `create_time_entry` with `work_package_id`, `hours` (ISO 8601 duration, e.g., `PT2H`), `spent_on` (date in YYYY-MM-DD format), and `activity_id`
2. Optionally include a `comment` describing the work performed
3. The time entry appears in the work package's time tracking section and in time reports

### List Time Entries for a Project
1. Use `list_time_entries` with `project_id` to retrieve all entries for the project
2. Filter by `from` and `to` date parameters to scope a reporting period
3. Filter by `user_id` to see entries for a specific team member

### List Time Entries for a Work Package
1. Use `list_time_entries` with `work_package_id` to retrieve all time logged on that item
2. Sum the `hours` values to calculate total time spent

### Correct a Time Entry
1. Use `get_time_entry` to retrieve the current values
2. Use `update_time_entry` with corrected `hours`, `spent_on`, `activity_id`, or `comment`

### Delete an Erroneous Time Entry
1. Use `delete_time_entry` with the `time_entry_id` to remove the record permanently
2. Verify deletion by attempting `get_time_entry` — it should return a 404

## Configuration
- Time Tracking module must be enabled per project in Project Settings > Modules
- Activity types are configured globally via Administration > Time Tracking > Activities
- Hourly rates for cost calculations are set per user or globally via Administration
- Time entry permissions are role-based: users need "Log time" permission to create entries

## Related Modules
- **Work Packages** — time entries are always linked to a specific work package
- **Cost Tracking** — time entries with hourly rates feed into cost reports and budget tracking
- **Budgets** — labor budgets compare planned hours against actual time entries
- **Activity** — time entry creation and updates appear in the work package activity feed
