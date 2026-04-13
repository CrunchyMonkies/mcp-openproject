# Team Workload Management

## Goal
Balance workload across team members to prevent burnout, identify over-allocation, and ensure work is distributed equitably. Use this workflow weekly or when onboarding new team members or when someone is absent.

## Prerequisites
- Team Planner module enabled
- Work Packages module enabled
- Time Tracking module enabled (for effort-based balancing)
- Role with permissions to list users, view work packages, and update assignees

## Modules Involved
- **Team Planner** — visualizes assignments across the calendar
- **Work Packages** — the assigned items driving workload
- **Time Tracking** — actual hours logged per person
- **Calendar** — working days and non-working days affecting capacity

## Process

### Step 1: List Team Members
Get all users who are members of the project.

```
tool_call: list_users(project_id: "my-project")
```

Note each user's ID for use in subsequent filters.

### Step 2: List All Assigned Work Packages per Person
For each team member, retrieve their open assigned work packages.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"assignee": {"operator": "=", "values": ["7"]}}, {"status": {"operator": "o", "values": []}}])
```

Repeat for each team member. Count the number of open items and sum estimated hours to compare load.

### Step 3: Check Time Logged per Person
Review how many hours each person has logged in the current period.

```
tool_call: list_time_entries(project_id: "my-project", filters: [{"user": {"operator": "=", "values": ["7"]}}, {"spent_on": {"operator": "between", "values": ["2026-04-07", "2026-04-13"]}}])
```

Repeat for each team member to compare actual effort.

### Step 4: Reassign Overloaded Work
Move work packages from overloaded team members to those with available capacity.

```
tool_call: update_work_package(id: 205, assignee: {id: 9})
```

Add a comment to explain the reassignment:

```
tool_call: add_comment(work_package_id: 205, comment: "Reassigned from @alice to @bob due to alice's current overload on the auth module sprint.")
```

### Step 5: Adjust Dates
If redistribution requires rescheduling, update start and due dates.

```
tool_call: update_work_package(id: 205, startDate: "2026-04-21", dueDate: "2026-04-25")
```

### Step 6: Check Calendar and Non-Working Days
Verify capacity calculations account for holidays and non-working days.

```
tool_call: list_days(filters: [{"date": {"operator": "between", "values": ["2026-04-14", "2026-04-30"]}}])
tool_call: list_non_working_days(year: 2026)
```

Subtract non-working days from each person's available capacity before assigning work.

### Step 7: Verify Balance
Re-run the workload check after reassignments to confirm the distribution is improved.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"status": {"operator": "o", "values": []}}, {"assignee": {"operator": "*", "values": []}}], group_by: "assignee")
```

## Data Flow
Users -> assigned Work Packages (open items creating load) -> Time Entries (actual hours, a lagging indicator of load). Calendar data provides the capacity denominator. After reassignment, Work Packages carry the new assignee; the Team Planner UI reflects the updated distribution.

## Tips & Pitfalls
- Count open work packages per person as a leading indicator; logged hours are a lagging indicator — use both together for an accurate picture.
- Always check non-working days before promising that someone can absorb extra work; a person with a holiday this week has reduced capacity even if their WP count looks low.
- When reassigning, add a comment on the work package explaining why — the original assignee needs context and the audit trail helps during sprint reviews.
- Avoid reassigning work packages that are already "In Progress" without first confirming with the original assignee that the handoff is clean.
- The Team Planner UI is the most efficient way to spot overloads visually; use the API calls above for data-driven verification and reporting.
