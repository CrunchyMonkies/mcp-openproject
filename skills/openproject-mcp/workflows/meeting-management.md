# Meeting Management

## Goal
Organize project meetings by creating action items before or during the meeting, recording outcomes, and tracking follow-up tasks to completion. Use this workflow for recurring standups, sprint reviews, steering committees, or any meeting that produces action items.

## Prerequisites
- Meetings module enabled (for meeting records in the UI)
- Work Packages module enabled (for action items)
- Activity module enabled (auto-enabled with work packages)
- Role with permissions to create/edit work packages and add comments

## Modules Involved
- **Meetings** — stores meeting agendas and minutes (managed via UI)
- **Work Packages** — action items arising from the meeting
- **Activity** — tracks progress on action items between meetings

## Process

### Step 1: Create Action Item Work Packages
Before or during the meeting, create work packages for expected or confirmed action items.

```
tool_call: create_work_package(project_id: "my-project", subject: "Confirm database vendor selection with CTO", type: "Task", priority: "High")
```

Create one work package per discrete action item. Avoid bundling multiple actions into a single work package.

### Step 2: Assign Action Items
Set the owner for each action item immediately, not after the meeting.

```
tool_call: update_work_package(id: 401, assignee: {id: 7})
```

### Step 3: Set Due Dates
Give every action item a concrete due date agreed in the meeting.

```
tool_call: update_work_package(id: 401, dueDate: "2026-04-21")
```

### Step 4: Track Action Item Progress
Between meetings, check the status of all action items assigned to the team.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"assignee": {"operator": "=", "values": ["7"]}}, {"status": {"operator": "o", "values": []}}, {"type": {"operator": "=", "values": ["Task"]}}])
```

### Step 5: Add Meeting Notes as Comments
Record meeting decisions, context, or discussion summaries on the relevant work package.

```
tool_call: add_comment(work_package_id: 401, comment: "Agreed in steering committee 2026-04-14: CTO has final sign-off authority. Alice to prepare vendor comparison matrix by 2026-04-21 for CTO review.")
```

### Step 6: Review Activity
At the start of the next meeting, review what changed on action items since the last session.

```
tool_call: list_activities(project_id: "my-project")
```

Filter mentally for action items created or updated since the last meeting date.

### Step 7: Follow Up on Overdue Items
Before each meeting, identify overdue action items so they can be escalated or rescheduled.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"dueDate": {"operator": "<t", "values": []}}, {"status": {"operator": "o", "values": []}}])
```

Address each overdue item: reassign, extend the date with justification, or escalate.

## Data Flow
Meeting (agenda/minutes in UI) -> Action Item Work Packages (tasks with assignee and due date) -> Comments (meeting notes and updates) -> Activity (progress history between meetings). The Meetings module in OpenProject UI stores the structured agenda; work packages are the actionable output that gets tracked.

## Tips & Pitfalls
- Create action item work packages during the meeting, not after — post-meeting creation loses context and some items get forgotten.
- Every action item must have an assignee and a due date before the meeting ends; items without both are not actionable.
- Use a consistent naming convention for action item subjects (e.g., "Action: [verb] [object] by [date]") so they are easy to find in work package lists.
- Do not use the Meetings module minutes as the sole record of action items — minutes are not easily filterable or trackable. Always create corresponding work packages.
- Check overdue items at the start of every meeting (Step 7) before creating new action items; this prevents an ever-growing list of forgotten tasks.
