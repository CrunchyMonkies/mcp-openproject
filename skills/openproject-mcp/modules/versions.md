# Versions

## Overview
The Versions module enables release and sprint planning by grouping work packages into named versions with start and end dates. The Roadmap view displays all versions alphabetically with their assigned work packages and a visual progress bar showing the percentage of closed versus open items.

## Key Concepts
- **Version**: A named milestone or release (e.g., "v1.0", "Sprint 3", "Q2 Release") with optional start/end dates and status
- **Roadmap**: Project view listing all versions with assigned work packages and completion progress
- **Progress Visualization**: Percentage bar showing closed work packages vs total per version
- **Version Status**: Open (active, accepting work), Locked (no changes), Closed (completed), or Archived (hidden from roadmap)
- **Sharing**: Versions can be shared with subprojects so child projects can assign their work packages to parent versions
- **Backlog Integration**: Each Scrum sprint is represented as a Version in the Backlogs module

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_versions` — retrieve all versions for a project including dates, status, and sharing settings
- `get_version` — fetch details of a single version by ID
- `create_version` — create a new version (sprint, release, or milestone marker)
- `update_version` — modify version name, dates, status, description, or sharing settings
- `delete_version` — remove a version permanently (work packages are unassigned, not deleted)

## Common Operations

### Create a Release Version
1. Use `create_version` with `project_id`, `name` (e.g., "v2.0"), `start_date`, and `due_date`
2. Set `status` to `open` for an active release being planned
3. The version appears on the Roadmap and is available for work package assignment

### Assign Work Packages to a Version
1. Use `update_work_package` with `version_id` set to the target version's ID
2. The work package appears under that version on the Roadmap view
3. Multiple work packages can be assigned to the same version

### Track Version Progress
1. Use `list_versions` to get all versions with their IDs
2. Use `list_work_packages` filtered by `version_id` to count total and closed work packages per version
3. Calculate completion: (closed count / total count) × 100 = percentage complete

### Close a Completed Version
1. Use `update_version` with `version_id` and `status` set to `closed`
2. Closed versions appear on the Roadmap with a completed indicator
3. Work packages can no longer be assigned to closed versions (unless status is changed back)

### Create a Sprint (Backlogs)
1. Use `create_version` with `project_id`, `name`, `start_date`, and `due_date`
2. The version automatically appears as a sprint in the Backlogs module
3. User stories can be moved to this sprint using `update_work_package` with `version_id`

## Configuration
- Versions module must be enabled per project in Project Settings > Modules
- At least one version must exist for the Roadmap to display
- Version sharing is configured per version; shared versions are visible in subprojects
- The Backlogs module uses Versions as the sprint container; both modules must be active for Scrum workflows

## Related Modules
- **Work Packages** — work packages are assigned to versions for release tracking
- **Backlogs** — each sprint is a Version; Backlogs module displays versions as sprint containers
- **Boards** — Version-type action boards use versions as column definitions
- **Project Overview** — version progress can be shown as a roadmap widget on the project overview
