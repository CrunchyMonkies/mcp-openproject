# OKR Management

## Goal
Track Objectives and Key Results using OpenProject work packages as the OKR structure. Use this workflow to set quarterly OKRs, link them to delivery work, and report progress to leadership.

## Prerequisites
- Work Packages module enabled
- Relations module enabled (for linking key results to deliverables)
- Role with permissions to create/edit work packages and relations

## Modules Involved
- **Work Packages** — objectives (parent) and key results (children) represented as WPs
- **Relations** — links key results to the delivery work packages that contribute to them
- **Activity** — tracks updates and progress changes over the OKR period

## Process

### Step 1: Create an Objective Work Package
Create the top-level objective as a Feature or Epic work package.

```
tool_call: create_work_package(project_id: "my-project", subject: "Q2 2026: Improve developer onboarding experience", type: "Epic", description: "Objective: Reduce time-to-first-commit for new developers from 3 days to 1 day by end of Q2 2026.", startDate: "2026-04-01", dueDate: "2026-06-30")
```

### Step 2: Create Key Result Work Packages
Add key results as child work packages under the objective.

```
tool_call: create_work_package(project_id: "my-project", subject: "KR1: Automated dev environment setup script reduces setup time to <30 min", type: "Feature", parent: {id: 501}, startDate: "2026-04-01", dueDate: "2026-05-31")
tool_call: create_work_package(project_id: "my-project", subject: "KR2: Onboarding documentation covers 100% of required tools", type: "Feature", parent: {id: 501}, startDate: "2026-04-01", dueDate: "2026-06-15")
tool_call: create_work_package(project_id: "my-project", subject: "KR3: New developer survey score >= 4.5/5 for onboarding experience", type: "Feature", parent: {id: 501}, startDate: "2026-06-01", dueDate: "2026-06-30")
```

### Step 3: Link Key Results to Delivery Work Packages
Connect key results to the specific deliverable work packages (tasks, bugs, features) that contribute to achieving them.

```
tool_call: create_relation(from_id: 502, to_id: 105, type: "relates")
tool_call: create_relation(from_id: 502, to_id: 106, type: "relates")
```

This makes it easy to trace which delivery work supports which key result.

### Step 4: Track Progress
Regularly check the percentage done on each key result and the parent objective.

```
tool_call: get_work_package(id: 501)
tool_call: get_work_package(id: 502)
```

Review `percentageDone` field. Update it manually or let it roll up from child work packages if rollup is configured.

### Step 5: Update Status
Reflect the confidence level or actual progress through status updates.

```
tool_call: update_work_package_status(id: 502, status: "In Progress")
```

Use status to indicate: New (not started), In Progress (on track), At Risk (off track), Closed (achieved).

### Step 6: Add Progress Comments
Document the current progress, blockers, and confidence rating on each key result check-in.

```
tool_call: add_comment(work_package_id: 502, comment: "Weekly check-in 2026-04-14: Script draft complete, currently testing on macOS and Linux. On track for May 31 target. Confidence: High.")
```

### Step 7: Generate OKR Summary
Produce a summary report for the leadership review.

```
tool_call: weekly_summary(project_id: "my-project")
```

Supplement with a manual list of objectives and their current percentage:

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"type": {"operator": "=", "values": ["Epic"]}}])
```

## Data Flow
Objective (Epic WP) -> Key Results (Feature WPs as children) -> Delivery Work Packages (Tasks/Features linked via `relates` relation). Progress flows upward: as delivery WPs close, key result percentage increases, which in turn updates the objective's aggregate progress. The relation graph makes the full traceability chain from strategic goal to individual task visible.

## Tips & Pitfalls
- Keep OKR work packages in a dedicated project or use a consistent naming prefix (e.g., "KR1:", "KR2:") to distinguish them from regular delivery work packages.
- Do not set `percentageDone` manually on the objective if child rollup is enabled — let the system aggregate it, or you will create conflicts.
- Weekly progress comments (Step 6) are more valuable than status changes alone; status tells you where something is, comments tell you why.
- OKRs span a quarter; ensure the `dueDate` on each objective and key result aligns with the quarter end date to keep reporting consistent.
- Avoid assigning too many deliverable WPs to a single key result — if a key result has more than 8-10 relations, it is likely too broad and should be split.
