# Stakeholder Reporting

## Goal
Generate reports and updates for stakeholders — including project sponsors, clients, and management — to communicate progress, risks, decisions, and next steps. Use this workflow on a recurring cadence (weekly or per milestone) or on demand.

## Prerequisites
- Project Overview module enabled
- News module enabled (for publishing updates)
- Work Packages module enabled
- Notifications module enabled (optional)
- Role with permissions to read work packages and create news items

## Modules Involved
- **Project Overview** — provides the top-level project status visible to stakeholders
- **Work Packages** — source of progress and blocker data
- **News** — publishes formal updates visible on the project dashboard
- **Notifications** — ensures relevant parties are alerted to new information

## Process

### Step 1: Generate Weekly Summary
Create an automated summary of project activity for the reporting period.

```
tool_call: weekly_summary(project_id: "my-project")
```

Review the output to identify key themes: what was completed, what is blocked, what is at risk.

### Step 2: Publish Project News
Write a stakeholder-facing update as a news item on the project.

```
tool_call: create_news(project_id: "my-project", title: "Sprint 12 Complete — Auth Module Delivered", summary: "The team completed all sprint goals. The new auth module is deployed to staging. Next sprint focuses on the reporting dashboard.", description: "Full sprint retrospective notes attached. Velocity: 38 points. 0 carry-over stories.")
```

### Step 3: Get Project Status
Retrieve the current project record to confirm status and basic metadata for the report.

```
tool_call: get_project(id: "my-project")
```

### Step 4: List Completed Work
Pull all work packages closed in the reporting period.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"status": {"operator": "=", "values": ["Closed"]}}, {"updatedAt": {"operator": "between", "values": ["2026-04-07", "2026-04-13"]}}])
```

### Step 5: List Blockers and Risks
Identify items that are blocked or on hold so risks are visible in the report.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"status": {"operator": "=", "values": ["Blocked", "On Hold"]}}])
```

Also check high-priority open items that are past their due date:

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"dueDate": {"operator": "<t", "values": []}}, {"status": {"operator": "o", "values": []}}])
```

### Step 6: Log Key Decisions
Record any decisions made during the reporting period for the audit trail.

```
tool_call: log_decision(project_id: "my-project", decision: "Deferred SSO integration to v2.1 to preserve v2.0 release date", decided_by: "Product Owner")
```

### Step 7: Check Notifications
Verify that stakeholders have been notified of relevant changes.

```
tool_call: list_notifications(filters: [{"project": {"operator": "=", "values": ["my-project"]}}])
```

## Data Flow
Work Packages (status, dates, assignees) -> Weekly Summary (aggregated view) -> News Item (stakeholder-facing publication). Decisions are logged separately as a governance record. Notifications confirm that changes have been communicated to the right people automatically.

## Tips & Pitfalls
- Run `weekly_summary` before drafting the news item — it surfaces data you may miss when manually reviewing work packages.
- Publish news items even when there is nothing unusual to report; regular updates build stakeholder confidence more than ad-hoc communications.
- Use `log_decision` for every significant scope, schedule, or budget change — this creates an auditable record that protects the team during project reviews.
- When listing completed work, use `updatedAt` with a date range rather than relying on status alone — work packages can be closed outside the reporting window.
- Blocked items should always appear in stakeholder reports with an owner and a target resolution date; use `add_comment` on the blocked WP to capture the resolution plan.
