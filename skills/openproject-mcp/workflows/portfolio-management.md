# Portfolio Management

## Goal
Manage multiple projects as a portfolio — gaining cross-project visibility into health, progress, and resource usage. Use this workflow for program managers or PMOs overseeing several concurrent projects.

## Prerequisites
- Projects module enabled on the instance
- Portfolios module enabled (if available on your OpenProject edition)
- Work Packages module enabled on each managed project
- Role with permissions to view all relevant projects and their work packages

## Modules Involved
- **Projects** — the portfolio is a collection of individual projects
- **Portfolios** — provides aggregated portfolio views (Enterprise edition)
- **Work Packages** — the delivery items within each project that signal project health

## Process

### Step 1: List All Projects
Retrieve all projects in the portfolio.

```
tool_call: list_projects()
```

Note the ID and identifier for each project you are managing.

### Step 2: Get Project Details and Status
For each project, retrieve its current status, description, and metadata.

```
tool_call: get_project(id: "project-alpha")
tool_call: get_project(id: "project-beta")
tool_call: get_project(id: "project-gamma")
```

Review `status`, `description`, and custom fields that indicate RAG (Red/Amber/Green) status if configured.

### Step 3: List Work Packages Across Projects
For each project, retrieve open work packages to assess delivery status.

```
tool_call: list_work_packages(project_id: "project-alpha", filters: [{"status": {"operator": "o", "values": []}}])
```

Repeat for each project. Look at total open count, overdue items, and blocked items.

### Step 4: Check Project Health
For each project, calculate health indicators from work package data:

- Open items: total count from `list_work_packages` with open status filter
- Overdue items: filter by `dueDate` before today and open status
- Blocked items: filter by status = Blocked or by relations of type `blocks`

```
tool_call: list_work_packages(project_id: "project-alpha", filters: [{"dueDate": {"operator": "<t", "values": []}}, {"status": {"operator": "o", "values": []}}])
```

### Step 5: Generate Per-Project Summaries
Produce a weekly summary for each project to capture narrative progress.

```
tool_call: weekly_summary(project_id: "project-alpha")
tool_call: weekly_summary(project_id: "project-beta")
tool_call: weekly_summary(project_id: "project-gamma")
```

### Step 6: Log Portfolio-Level Decisions
Record cross-project decisions that affect multiple projects or resource allocation.

```
tool_call: log_decision(project_id: "project-alpha", decision: "Portfolio steering committee approved resource reallocation: 2 developers move from Project Beta to Project Alpha for Q2 to accelerate delivery of critical path items.", decided_by: "Portfolio Director")
```

### Step 7: Monitor via Notifications
Check for unread notifications across projects to stay aware of escalations.

```
tool_call: list_notifications()
```

Review notifications flagged as high priority or mentioning blockers.

## Data Flow
Projects (individual containers) -> Work Packages (delivery items per project) -> Summaries (aggregated per project) -> Portfolio-level decisions (logged for governance). There is no automatic cross-project rollup via the API; portfolio health is assembled by querying each project individually and aggregating the results. The Portfolios module (Enterprise) provides a UI-level aggregation view.

## Tips & Pitfalls
- Run `list_projects` first and note which projects are active — archived or closed projects will still appear and can skew health counts.
- When comparing project health, use the same filters across all projects for consistency; mixing filter criteria makes cross-project comparison meaningless.
- Log portfolio decisions in the most relevant project if a portfolio-level project does not exist; use a consistent tag or prefix in the decision text to make them searchable.
- The Portfolios module (Enterprise only) provides built-in aggregated views; if it is not available, the manual approach in Steps 3-4 is the equivalent.
- Schedule portfolio reviews on a fixed cadence (weekly or bi-weekly); ad-hoc reviews catch fewer problems because project managers expect the check-in and prepare for it.
