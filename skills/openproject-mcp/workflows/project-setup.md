# Project Setup

## Goal
Initialize a new project with proper configuration including team membership, work package types, and an initial backlog. Use this workflow whenever a new project is created to ensure it is ready for work from day one.

## Prerequisites
- Administrator or project creator role on the OpenProject instance
- User accounts already created for team members
- Role definitions already configured on the instance

## Modules Involved
- **Projects** — the top-level container being configured
- **Members** — team members with roles scoped to this project
- **Work Packages** — initial backlog items and structural work packages
- **Versions** — release or sprint versions configured up front

## Process

### Step 1: Create the Project
Create the project with a unique identifier and display name.

```
tool_call: create_project(name: "Customer Portal Redesign", identifier: "customer-portal", description: "Redesign of the customer-facing portal for improved UX", public: false)
```

The `identifier` becomes the URL slug; choose it carefully as it cannot easily be changed later.

### Step 2: List Available Work Package Types
Check which work package types are available to understand what can be created in this project.

```
tool_call: list_types(project_id: "customer-portal")
```

Note the IDs for types you will use (Epic, Feature, UserStory, Bug, Task, Milestone).

### Step 3: List Available Statuses
Confirm which workflow statuses exist for work packages.

```
tool_call: list_statuses(project_id: "customer-portal")
```

### Step 4: List Available Priorities
Confirm the priority options available for triaging work packages.

```
tool_call: list_priorities(project_id: "customer-portal")
```

### Step 5: Add Team Members
Look up available roles, then assign each team member with the appropriate role.

```
tool_call: list_roles()
tool_call: create_membership(project_id: "customer-portal", user_id: 7, role_ids: [3])
```

Repeat `create_membership` for each team member. Common roles: Developer (can edit WPs), Member (can view and comment), Manager (can manage versions and members).

### Step 6: Create Initial Work Packages
Seed the project backlog with known work items.

```
tool_call: create_work_package(project_id: "customer-portal", subject: "User authentication redesign", type: "Feature", priority: "High")
```

### Step 7: Set Up Versions for Releases
Create planned release versions so work can be scoped immediately.

```
tool_call: create_version(project_id: "customer-portal", name: "v1.0 - MVP", startDate: "2026-05-01", endDate: "2026-07-31", status: "open")
```

### Step 8: Verify Configuration
Confirm the project and its initial content are correctly set up.

```
tool_call: get_project(id: "customer-portal")
tool_call: list_work_packages(project_id: "customer-portal")
```

## Data Flow
Project -> Members (users with roles scoped to the project) -> Work Packages (backlog items) -> Versions (release containers). The project identifier is the foreign key used in all subsequent API calls to scope operations to this project.

## Tips & Pitfalls
- Choose the `identifier` carefully at creation time — changing it later breaks any bookmarks or integrations using the old URL.
- Add at least one member with a Manager role before inviting other team members; otherwise no one will be able to manage membership without admin access.
- Run `list_types` and `list_statuses` on the new project after creation, not on another project — types and statuses can be configured differently per project.
- Create at least one version before the first sprint planning session; without a version, backlog assignment is not possible.
- If the project should be private (internal only), set `public: false` at creation — the default may vary by instance configuration.
