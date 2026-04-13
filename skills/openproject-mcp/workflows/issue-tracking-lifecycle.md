# Issue Tracking Lifecycle

## Goal
Track an issue from initial creation through triage, development, and resolution. Use this workflow for bug reports, support escalations, or any discrete problem that needs a documented resolution path.

## Prerequisites
- Work Packages module enabled
- Relations module enabled (for linking related issues)
- Activity module enabled (auto-enabled with work packages)
- Notifications module enabled (optional, for alerting assignees)
- Role with permissions to create/edit work packages and add comments

## Modules Involved
- **Work Packages** — the issue record with status, priority, assignee, and description
- **Relations** — links to related, blocking, or duplicate issues
- **Activity** — full change history of the issue
- **Notifications** — alerts sent to assignees and watchers
- **Comments** — threaded discussion on the issue

## Process

### Step 1: Create the Issue
Log the issue with sufficient detail for a developer to reproduce or understand it.

```
tool_call: create_work_package(project_id: "my-project", subject: "Login fails with SSO when session cookie is expired", type: "Bug", description: "Steps to reproduce:\n1. Log in via SSO\n2. Wait for session to expire (>1h)\n3. Attempt any authenticated action\n\nExpected: redirect to SSO login\nActual: 500 error returned", priority: "High")
```

### Step 2: Set Priority
If priority was not set at creation, or needs updating after triage, set it explicitly.

```
tool_call: update_work_package(id: 101, priority: {id: 8})
```

Use `list_priorities` to find priority IDs if needed.

### Step 3: Assign to a Developer
Assign the issue to the team member responsible for investigation.

```
tool_call: update_work_package(id: 101, assignee: {id: 7})
```

### Step 4: Link Related Issues
Connect the issue to duplicates, related bugs, or blocking items.

```
tool_call: create_relation(from_id: 101, to_id: 89, type: "relates")
tool_call: create_relation(from_id: 101, to_id: 95, type: "duplicates")
tool_call: create_relation(from_id: 101, to_id: 103, type: "blocks")
```

Use `relates` for general linkage, `duplicates` when the same defect already exists, `blocks` when this issue prevents other work from proceeding.

### Step 5: Developer Starts Work
Update status to In Progress when work begins.

```
tool_call: update_work_package_status(id: 101, status: "In Progress")
```

### Step 6: Add Comments and Updates
Document investigation findings, workarounds, and progress updates.

```
tool_call: add_comment(work_package_id: 101, comment: "Root cause identified: the SSO token refresh endpoint returns 401 when the original session cookie has expired rather than initiating a new SSO flow. Fix in progress in branch fix/sso-session-refresh.")
```

### Step 7: Log Time Worked
Record hours spent investigating and fixing the issue.

```
tool_call: create_time_entry(project_id: "my-project", work_package_id: 101, hours: 3.5, spent_on: "2026-04-14", comment: "Root cause analysis and initial fix implementation")
```

### Step 8: Track Changes
Review the full history of the issue to ensure nothing was missed.

```
tool_call: list_activities(work_package_id: 101)
```

### Step 9: Resolve the Issue
Mark the issue resolved or closed once the fix is verified.

```
tool_call: update_work_package_status(id: 101, status: "Resolved")
```

Add a closing comment with resolution details:

```
tool_call: add_comment(work_package_id: 101, comment: "Fixed in commit a3f91c2. The SSO middleware now checks token expiry before attempting cookie validation and initiates a fresh SSO redirect. Deployed to staging 2026-04-15.")
```

### Step 10: Verify via Notifications
Confirm that watchers and the reporter were notified of the resolution.

```
tool_call: list_notifications(filters: [{"work_package": {"operator": "=", "values": ["101"]}}])
```

## Data Flow
Work Package (issue record) -> Relations (linked issues form a dependency/duplicate graph) -> Comments (discussion thread) -> Time Entries (effort logged) -> Activity (immutable audit trail). Notifications are generated automatically by OpenProject on status changes and new comments.

## Tips & Pitfalls
- Write a detailed description at creation time — sparse bug reports slow down developers and result in extra comment threads asking for basic information.
- Use `duplicates` relation immediately when a known duplicate is found; this prevents multiple developers working on the same root cause independently.
- Do not skip the "Resolved" status if your workflow has one; jumping straight to "Closed" can bypass QA verification steps that the workflow is designed to enforce.
- Log time on each session, not in a single retroactive entry — daily entries provide accurate data for bug-fix cost analysis.
- The `list_activities` call on a specific `work_package_id` returns only that issue's history; omitting the filter returns project-wide activity, which is harder to parse.
