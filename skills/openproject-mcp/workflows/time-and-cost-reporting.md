# Time and Cost Reporting

## Goal
Track and report on project time and costs to maintain budget visibility, support invoicing, and identify overruns early. Use this workflow throughout a project's lifecycle to maintain an accurate picture of effort spent versus budget allocated.

## Prerequisites
- Time Tracking module enabled
- Budgets module enabled (for cost comparison)
- Cost Tracking module enabled (optional, for non-labor costs)
- Role with permissions to log time entries and view budgets

## Modules Involved
- **Time Tracking** — records hours logged against work packages
- **Budgets** — holds planned cost figures for comparison against actuals
- **Work Packages** — the items time is logged against
- **Cost Tracking** — records non-labor costs such as licenses or hardware

## Process

### Step 1: Review the Project Budget
Retrieve the current budget to understand planned spend before logging work begins.

```
tool_call: get_budget(project_id: "my-project")
```

Note the budgeted hours and cost figures for later comparison.

### Step 2: Log Time Against Work Packages
Team members record hours as work is completed, referencing the specific work package.

```
tool_call: create_time_entry(project_id: "my-project", work_package_id: 101, hours: 3.0, spent_on: "2026-04-14", activity_id: 2, comment: "Implemented data export feature")
```

### Step 3: Review Time Entries by Project or Work Package
Retrieve logged time filtered to a specific project or work package for spot checking.

```
tool_call: list_time_entries(project_id: "my-project", filters: [{"work_package": {"operator": "=", "values": ["101"]}}])
```

Filter by date range for period reporting:

```
tool_call: list_time_entries(project_id: "my-project", filters: [{"spent_on": {"operator": "between", "values": ["2026-04-01", "2026-04-30"]}}])
```

### Step 4: Check Cumulative Time on a Work Package
Get the work package detail to see total hours spent and remaining estimated time.

```
tool_call: get_work_package(id: 101)
```

Review `spentTime` and `remainingTime` fields.

### Step 5: Compare Actual vs Budgeted
Retrieve the budget again after a period of logging to compare actuals.

```
tool_call: get_budget(project_id: "my-project")
```

Compare `spentHours` and `spentCosts` against the planned figures from Step 1.

### Step 6: Generate a Time Report
Pull all time entries for the reporting period to share with stakeholders or for invoicing.

```
tool_call: list_time_entries(project_id: "my-project", filters: [{"spent_on": {"operator": "between", "values": ["2026-04-01", "2026-04-30"]}}, {"user": {"operator": "=", "values": ["7", "8", "12"]}}])
```

### Step 7: Log Budget Decisions
Record any approved budget changes or variance explanations for the audit trail.

```
tool_call: log_decision(project_id: "my-project", decision: "Approved 10% budget increase for Q2 due to scope addition in auth module", decided_by: "Project Sponsor")
```

## Data Flow
Budget (planned figures) <- compared against -> Time Entries (actuals logged per Work Package). Work packages aggregate `spentTime` from their child time entries. Budget figures are set manually or via the budget module; they do not automatically pull from time entries but serve as the comparison baseline.

## Tips & Pitfalls
- Always specify `activity_id` when creating time entries; entries without an activity type may not appear in cost reports that filter by activity.
- Log time daily or weekly — retroactive bulk logging reduces accuracy and makes anomaly detection harder.
- Use date-range filters on `list_time_entries` for period reports rather than pulling all entries and filtering client-side.
- Budget figures in OpenProject are not automatically updated when scope changes; after a scope change, update the budget record and log the decision.
- `get_work_package` shows `spentTime` as a running total; to see the breakdown by person or date, use `list_time_entries` with filters.
