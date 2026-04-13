# Release Management

## Goal
Plan and track a software release from initial scoping through delivery. Use this workflow to coordinate work packages, milestones, and dependencies that together constitute a shippable release.

## Prerequisites
- Versions module enabled
- Work Packages module enabled
- Relations module enabled (for dependency tracking)
- Gantt / Roadmap module enabled (for date visualization)
- Role with permissions to create versions, work packages, and relations

## Modules Involved
- **Versions** — represents the release and its target date
- **Work Packages** — features, bugs, and milestones scoped to the release
- **Gantt** — visualizes timeline and critical path
- **Boards** — provides Kanban-style visibility into release item statuses
- **Relations** — captures precedes/follows dependencies between work packages

## Process

### Step 1: Create the Release Version
Define the release with a target date and description.

```
tool_call: create_version(project_id: "my-project", name: "v2.0.0", startDate: "2026-04-01", endDate: "2026-06-30", description: "Major release with new reporting module", status: "open")
```

### Step 2: Create Key Milestone Work Packages
Add milestones for important dates such as feature freeze, code freeze, and release day.

```
tool_call: create_work_package(project_id: "my-project", subject: "Feature Freeze", type: "Milestone", dueDate: "2026-05-31", version: {id: 42})
```

Repeat for each milestone.

### Step 3: Assign Work Packages to the Release
Move scoped features and bugs into the release version.

```
tool_call: update_work_package(id: 301, version: {id: 42})
```

### Step 4: Set Dependencies Between Work Packages
Define sequencing so that blocked items are visible before scheduling.

```
tool_call: create_relation(from_id: 301, to_id: 302, type: "precedes")
```

Use `follows` for the inverse. Use `blocks` when one WP actively prevents another from starting.

### Step 5: Track Progress via Roadmap
Check version completion and review which work packages remain open.

```
tool_call: get_version(id: 42)
tool_call: list_work_packages(project_id: "my-project", filters: [{"version": {"operator": "=", "values": ["42"]}}])
```

### Step 6: Use Boards for Status Visibility
Filter work packages by version to see the Kanban state of release items.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"version": {"operator": "=", "values": ["42"]}}, {"status": {"operator": "o", "values": []}}])
```

### Step 7: Generate Release Summary
Produce a consolidated status report for stakeholders.

```
tool_call: weekly_summary(project_id: "my-project")
```

## Data Flow
Version (release) -> Work Packages (features/bugs) -> Milestone Work Packages (gate dates). Relations between work packages define the dependency graph that drives Gantt scheduling. The version end date is the release target; milestone due dates are intermediate gates.

## Tips & Pitfalls
- Set `endDate` on the version to match the planned release date; this drives the roadmap view in the UI.
- Create milestones before assigning all work packages so you can sequence work against them.
- Use `precedes` on the release-blocking work, not `blocks` — `precedes` carries date semantics understood by the scheduler; `blocks` is a soft dependency signal.
- Do not close the version until all work packages in it are closed; closing early hides incomplete items from the roadmap.
- If scope changes, update the version description and add a `log_decision` entry explaining the change for audit purposes.
