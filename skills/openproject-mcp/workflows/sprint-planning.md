# Sprint Planning

## Goal
Plan and execute a Scrum sprint. Use this workflow at the start of each sprint to define scope, assign work, and track delivery through to sprint close.

## Prerequisites
- Backlogs module enabled
- Versions module enabled
- Time Tracking module enabled (optional, for logging effort)
- Role with permissions to create/edit work packages and versions

## Modules Involved
- **Backlogs** — source of user stories and bugs available for sprint selection
- **Versions** — represents the sprint with start/end dates
- **Work Packages** — individual stories, bugs, and tasks tracked during the sprint
- **Team Planner** — visualizes assignments across the sprint timeline
- **Activity** — audit trail of changes made during the sprint

## Process

### Step 1: Create the Sprint Version
Create a version to represent the sprint with defined start and end dates.

```
tool_call: create_version(project_id: "my-project", name: "Sprint 12", startDate: "2026-04-14", endDate: "2026-04-27", status: "open")
```

### Step 2: List Product Backlog Items
Retrieve candidate work packages (User Stories and Bugs) that are not yet assigned to a version.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"type": {"operator": "=", "values": ["UserStory", "Bug"]}}, {"version": {"operator": "!*", "values": []}}])
```

### Step 3: Assign Stories to the Sprint
Move selected backlog items into the sprint version.

```
tool_call: update_work_package(id: 101, version: {id: 42})
```

Repeat for each selected story.

### Step 4: Estimate Story Points
Set story point estimates on each work package being brought into the sprint.

```
tool_call: update_work_package(id: 101, storyPoints: 5)
```

### Step 5: Break Stories into Tasks
Create child work packages (type=Task) under each story to represent implementation steps.

```
tool_call: create_work_package(project_id: "my-project", subject: "Write unit tests for login", type: "Task", parent: {id: 101})
```

### Step 6: Assign Tasks to Team Members
Set the assignee on each task so workload is distributed across the team.

```
tool_call: update_work_package(id: 205, assignee: {id: 7})
```

### Step 7: Monitor Progress via Activity
Review the activity stream to see what has changed since sprint start.

```
tool_call: list_activities(project_id: "my-project")
```

### Step 8: Track Time Spent
Have team members log time against work packages as they complete work.

```
tool_call: create_time_entry(project_id: "my-project", work_package_id: 205, hours: 2.5, spent_on: "2026-04-16", comment: "Implemented login controller")
```

### Step 9: Close Completed Items
Move finished work packages to a closed/done status.

```
tool_call: update_work_package_status(id: 205, status: "Closed")
```

### Step 10: Review Sprint Outcome
Generate a summary of completed, in-progress, and unfinished items.

```
tool_call: weekly_summary(project_id: "my-project")
```

## Data Flow
Version (sprint) -> Work Packages (stories/bugs) -> child Work Packages (tasks) -> Time Entries (effort logged against tasks). The version ties all work packages together for reporting. Relations between parent stories and child tasks are set via the `parent` field on creation.

## Tips & Pitfalls
- Always set `startDate` and `endDate` on the version; without these, backlog tooling cannot correctly scope the sprint.
- Do not assign the version directly to tasks — assign it to the parent story. Tasks inherit sprint context through the parent relationship.
- Estimate story points before moving items to the sprint, not after, to keep velocity tracking accurate.
- If a story is not completed by sprint end, do not close it; move it to the next sprint version instead of leaving it in the closed sprint.
- Use `list_activities` regularly during the sprint rather than only at the end to catch blockers early.
