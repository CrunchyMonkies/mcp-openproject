# Agile Workflow

## Goal
Run an agile/Kanban development workflow where work flows continuously through status columns without fixed sprint boundaries. Use this workflow for teams that prefer flow-based delivery over time-boxed iterations.

## Prerequisites
- Boards module enabled
- Work Packages module enabled
- Backlogs module enabled (optional, for backlog grooming)
- Role with permissions to create and update work packages

## Modules Involved
- **Boards** — Kanban board for visualizing work item flow
- **Work Packages** — the items flowing through the board
- **Backlogs** — source of incoming work before it enters the active flow
- **Activity** — audit trail of status changes and updates

## Process

### Step 1: List Work Packages by Status
Get a snapshot of what is in each workflow column.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"status": {"operator": "=", "values": ["In Progress"]}}])
```

Repeat for other statuses: New, In Review, Done.

### Step 2: Create New Work Items
Add incoming work to the backlog or directly to the board.

```
tool_call: create_work_package(project_id: "my-project", subject: "Add export to CSV feature", type: "Feature", priority: "Normal", status: "New")
```

### Step 3: Move Items Through the Workflow
Update status to reflect the item's current position on the board.

```
tool_call: update_work_package_status(id: 101, status: "In Progress")
```

Progress through the agreed workflow states: New -> In Progress -> In Review -> Done/Closed.

### Step 4: Track Blockers
Mark items that are blocked by other work using a relation.

```
tool_call: create_relation(from_id: 101, to_id: 98, type: "blocks")
```

Optionally add a comment explaining the blocker:

```
tool_call: add_comment(work_package_id: 101, comment: "Blocked by #98 — waiting on API contract definition")
```

### Step 5: Monitor Activity
Review recent changes to catch items that have stalled.

```
tool_call: list_activities(project_id: "my-project")
```

### Step 6: Review Velocity
Count closed work packages within a date range to measure throughput.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"status": {"operator": "=", "values": ["Closed"]}}, {"updatedAt": {"operator": "between", "values": ["2026-04-01", "2026-04-30"]}}])
```

### Step 7: Generate Status Report
Produce a summary for stakeholders or retrospectives.

```
tool_call: weekly_summary(project_id: "my-project")
```

## Data Flow
Work Packages move through Status transitions (New -> In Progress -> In Review -> Done). Relations of type `blocks` create a dependency graph that makes blockers explicit. Activity records each status change with a timestamp and actor, providing the flow history needed for cycle time analysis.

## Tips & Pitfalls
- Limit work in progress (WIP) by checking how many items are in "In Progress" before pulling new work — `list_work_packages` with a status filter serves as a WIP counter.
- Use the `blocks` relation type to make blockers visible; do not leave blocked items in "In Progress" without flagging them.
- Avoid creating work packages with no type — the board may not display them in the expected column without a type assignment.
- The `list_activities` feed updates in near real-time; review it during standups to identify items that have not moved in more than a day.
- For cycle time tracking, use the `createdAt` and `updatedAt` fields on closed work packages; `weekly_summary` provides a human-readable version of throughput data.
