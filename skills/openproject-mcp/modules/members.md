# Members

## Overview
The Members module manages who has access to a project and what they can do within it. Each member is assigned one or more roles that define their permissions. Groups allow bundling multiple users for consistent role assignment, and user statuses track whether accounts are active, invited, or locked.

## Key Concepts
- **Member**: A user with access to a specific project, assigned at least one role
- **Role**: A named set of permissions (e.g., Developer, Reporter, Project Admin) controlling what actions a member can perform
- **Group**: A collection of users; assigning a group to a project grants all group members the specified role
- **User Statuses**: Active (can log in), Invited (email sent, not yet accepted), Locked (access suspended), Registered (self-registered, awaiting admin activation)
- **Sharing**: Enterprise feature allowing work packages to be shared with users who are not project members
- **Inherited Membership**: Members of a parent project may inherit access to subprojects depending on configuration

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_memberships` — retrieve all memberships for a project or for a specific user
- `get_membership` — fetch details of a single membership including roles
- `create_membership` — add a user or group to a project with specified roles
- `update_membership` — change the roles assigned to an existing membership
- `delete_membership` — remove a user or group from a project
- `list_users` — retrieve all users in the OpenProject instance with filtering options
- `list_groups` — retrieve all user groups defined in the instance

## Common Operations

### Add a User to a Project
1. Use `list_users` to find the user's ID by searching their name or email
2. Use `create_membership` with `project_id`, `user_id`, and `role_ids` array
3. The user immediately gains project access with the assigned roles

### Add a Group to a Project
1. Use `list_groups` to find the group's ID
2. Use `create_membership` with `project_id`, `group_id`, and `role_ids` array
3. All users in the group gain project access with the assigned roles

### List All Project Members
1. Use `list_memberships` with `project_id` to retrieve all members and their roles
2. The response includes user details, role names, and membership creation date
3. Filter by `role_id` to find all members with a specific role

### Change a Member's Role
1. Use `list_memberships` with `project_id` and `user_id` to find the membership ID
2. Use `update_membership` with `membership_id` and the new `role_ids` array
3. Old roles are replaced with the new role set

### Remove a Member from a Project
1. Use `list_memberships` to find the `membership_id` for the user
2. Use `delete_membership` with the `membership_id` to revoke project access
3. The user loses all project access immediately

## Configuration
- Members module is always active; it cannot be disabled per project
- Roles are defined globally via Administration > Roles and Permissions
- Group management is in Administration > Groups
- Work package sharing (Enterprise) is configured per work package in its sharing settings

## Related Modules
- **Work Packages** — assignee and responsible fields reference project members
- **Boards** — assignee-type action boards use project members as column definitions
- **Team Planner** — assignee rows in the Team Planner are drawn from project members
- **Meetings** — attendees for meetings are selected from project members
- **Notifications** — notification targeting uses member and role information
