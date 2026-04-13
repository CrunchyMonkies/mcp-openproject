# Backlogs

## Overview
The Backlogs module provides Scrum methodology support within OpenProject, offering product backlog management, sprint planning, and a visual taskboard for tracking sprint progress. It organizes user stories and bugs into prioritized backlogs and time-boxed sprints, with story point estimation and burndown chart velocity tracking.

## Key Concepts
- **Product Backlog**: Prioritized list of user stories representing all planned work not yet assigned to a sprint
- **Sprint Backlog**: Subset of user stories selected for a specific sprint; each sprint corresponds to an OpenProject Version
- **Bug Backlog**: Separate backlog dedicated to bug-type work packages
- **Story Points**: Relative effort estimates assigned to user stories for velocity calculation
- **Velocity**: Average story points completed per sprint, used for future sprint capacity planning
- **Burndown Chart**: Visual chart showing remaining story points over the sprint duration
- **Taskboard**: Visual board showing sprint stories broken into tasks, draggable between To Do / In Progress / Done columns
- **Sprint**: A fixed-duration iteration represented as an OpenProject Version with start and end dates

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_work_packages` — retrieve user stories and bugs in the product or sprint backlog; filter by version
- `create_work_package` — create new user stories or tasks in the backlog
- `update_work_package` — update story points, status, sprint assignment, or priority order
- `list_versions` — retrieve all sprints/versions configured for the project
- `create_version` — create a new sprint (version) with start and end dates

## Common Operations

### Create a New Sprint
1. Use `create_version` with `project_id`, `name` (e.g., "Sprint 3"), `start_date`, and `due_date`
2. The version appears as a sprint in the Backlogs module
3. Set `status` to `open` for an active sprint

### Add a User Story to the Product Backlog
1. Use `create_work_package` with `type_id` corresponding to "User Story" and no `version_id`
2. Set `story_points` if estimation is needed
3. The work package appears in the product backlog

### Move a User Story to a Sprint
1. Use `update_work_package` with `version_id` set to the target sprint's version ID
2. The story moves from the product backlog to the sprint backlog

### Retrieve Sprint Backlog Contents
1. Use `list_versions` to find the sprint's version ID
2. Use `list_work_packages` filtered by `version_id` to retrieve all stories in the sprint
3. Filter further by `type` to separate stories from tasks

### Update Story Points
1. Use `update_work_package` with `story_points` field set to the estimated value
2. Burndown charts in the UI automatically reflect the updated estimates

## Configuration
- Backlogs module must be enabled per project in Project Settings > Modules
- Work package types must include "User Story" and "Task" types (configurable via Administration > Types)
- Sprints require the Versions module to be active; each sprint is a Version
- Story points field must be enabled on relevant work package types

## Related Modules
- **Versions** — each sprint is an OpenProject Version; version management underpins sprint creation
- **Work Packages** — user stories, tasks, and bugs are all work packages with scrum-specific types
- **Boards** — Boards module provides a general Kanban view; Backlogs taskboard is Scrum-specific
- **Time Tracking** — log time against sprint tasks to track actual vs estimated effort
