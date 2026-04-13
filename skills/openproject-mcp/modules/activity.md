# Activity

## Overview
The Activity module provides a comprehensive audit trail of all changes across a project, tracking edits to work packages, project attributes, news, budgets, wiki pages, forums, and time entries. Work package comments support rich collaboration features including @mentions, emoji reactions, quoting, and internal (Enterprise) vs public visibility.

## Key Concepts
- **Activity Feed**: Chronological list of all changes and comments on a work package or across a project
- **Change Tracking**: Records attribute changes with before/after values for status, assignee, dates, custom fields, and more
- **Comments**: Free-text notes on work packages supporting Markdown, @mentions, emoji reactions, and quote-reply
- **Internal Comments** (Enterprise): Comments visible only to project members, not external stakeholders
- **@Mentions**: Tag users with `@username` in comments to trigger targeted notifications
- **Change Aggregation**: Rapid successive changes are grouped into a single changeset to reduce noise
- **Real-Time Updates**: Activity feed updates in real time without page refresh (v15.0+)
- **Unlimited History**: All activity is retained indefinitely; no automatic pruning
- **Filters**: View all activity, comments only, or changes only

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_activities` — retrieve activity entries (changes and comments) for a work package or project
- `get_activity` — fetch details of a single activity entry
- `add_comment` — add a new comment to a work package (appears in the activity feed)

## Common Operations

### Retrieve Activity for a Work Package
1. Use `list_activities` with `work_package_id` to get all changes and comments for that work package
2. Filter by `type` (`comment` or `activity`) to show only comments or only attribute changes
3. Results are ordered chronologically; use `offset` and `pageSize` for pagination through long histories

### Add a Comment to a Work Package
1. Use `add_comment` with `work_package_id` and `comment` text (Markdown supported)
2. To @mention a user, include `@username` or `@user_id` in the comment body
3. The comment appears immediately in the work package activity feed and triggers notifications for mentioned users and watchers

### Retrieve Recent Project Activity
1. Use `list_activities` with `project_id` to get a feed of all recent changes across the project
2. Filter by date range using `from` and `to` parameters for a specific period
3. Use the results to generate a project status update or change log report

### Get Details of a Specific Activity Entry
1. Use `get_activity` with `activity_id` to fetch the full details of a change or comment
2. The response includes the actor (who made the change), timestamp, and change details

## Configuration
- Activity tracking is always enabled; it cannot be disabled per project
- Internal comments (Enterprise) require the Enterprise edition; enabled per work package comment
- Real-time activity feed updates require OpenProject v15.0 or later
- Activity retention is unlimited; no configuration required for history length
- @mention notifications respect individual user notification preference settings

## Related Modules
- **Work Packages** — activity feed is the primary collaboration surface for work packages
- **Notifications** — comments and changes in the activity feed trigger notifications for assignees, watchers, and mentioned users
- **Wiki** — wiki page edits appear in the project activity feed
- **Time Tracking** — time entry creation and updates appear in work package activity
