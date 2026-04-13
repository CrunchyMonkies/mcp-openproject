# Work Packages

## Overview
Work packages are the core building blocks of project management in OpenProject, representing tasks, features, bugs, milestones, phases, epics, user stories, risks, and change requests. Each work package has a unique ID across all projects and a configurable set of attributes. Types and custom fields are configurable per project via admin settings.

## Key Concepts
- **Types**: Configurable categories (Task, Feature, Bug, Milestone, Phase, Epic, User Story, Risk, Change Request) set per project by admins
- **ID**: Unique identifier across all projects in the instance
- **Hierarchy**: Parent/child relationships enabling work breakdown structures (WBS)
- **Relations**: Predecessor/follower, blocks/blocked by, duplicates, includes/part of, requires/required by
- **Status**: Workflow-driven status transitions configurable per type
- **Assignee**: User responsible for completing the work package
- **Priority**: Urgency indicator (Low, Normal, High, Immediate, etc.)
- **Custom Fields**: Admin-defined fields extending default attributes

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_work_packages` — retrieve a filtered, paginated list of work packages
- `get_work_package` — fetch full details of a single work package by ID
- `create_work_package` — create a new work package in a project
- `update_work_package` — modify attributes of an existing work package
- `update_work_package_status` — change the status of a work package
- `delete_work_package` — remove a work package permanently
- `add_comment` — add a comment/note to a work package

## Common Operations

### Create a Work Package
1. Use `create_work_package` with required fields: `project_id`, `subject`, `type_id`
2. Optionally include `assignee_id`, `priority_id`, `start_date`, `due_date`, `description`
3. The response returns the new work package with its assigned ID

### List Work Packages with Filters
1. Use `list_work_packages` with `project_id` to scope to a project
2. Apply filters for `status`, `assignee`, `type`, `priority`, or date ranges
3. Use `pageSize` and `offset` for pagination through large result sets

### Update Work Package Status
1. Retrieve current work package with `get_work_package` to see allowed status transitions
2. Use `update_work_package_status` with `work_package_id` and target `status_id`
3. Status transitions are validated against the configured workflow

### Build a Work Breakdown Structure
1. Create parent work package with `create_work_package`
2. Create child work packages using `create_work_package` with `parent_id` set to the parent's ID
3. Use `list_work_packages` filtered by `parent_id` to retrieve children

### Add a Comment
1. Use `add_comment` with `work_package_id` and `comment` text (supports Markdown)
2. Comments appear in the work package activity feed

## Configuration
Work packages are available in all projects by default. To customize:
- Enable/disable specific types per project in Project Settings > Types
- Add custom fields via Administration > Custom Fields, then enable per project
- Configure status workflows via Administration > Workflows
- Sharing work packages with non-members requires the Enterprise edition

## Related Modules
- **Gantt Charts** — visualizes work packages with dates as timeline bars
- **Boards** — displays work packages as cards in Kanban-style boards
- **Backlogs** — organizes work packages as user stories in sprints
- **Time Tracking** — log time entries against individual work packages
- **Cost Tracking** — associate unit costs with work packages
- **Versions** — assign work packages to versions/releases for roadmap planning
- **Activity** — tracks all changes and comments on work packages
- **File Storage** — attach files and link cloud storage items to work packages
