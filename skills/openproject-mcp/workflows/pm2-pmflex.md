# PM2/PMflex

## Goal
Implement the PM2/PMflex project management methodology used in EU public sector and institutional projects. PM2 structures projects into four phases (Initiating, Planning, Executing, Closing) with formal phase gates and documented governance artifacts. Use this workflow for grant-funded, public sector, or compliance-driven projects that require auditable phase management.

## Prerequisites
- Work Packages module enabled
- Versions module enabled (one version per phase)
- Relations module enabled (for phase sequencing)
- Activity module enabled (auto-enabled with work packages)
- Role with permissions to create versions, work packages, and relations

## Modules Involved
- **Work Packages** — phase deliverables, milestones, and tasks
- **Versions** — one version per PM2 phase, acting as the phase container
- **Relations** — enforces phase sequencing via precedes/follows dependencies
- **Activity** — audit trail of decisions and changes throughout the project

## Process

### Step 1: Create Phase Versions
Create one version per PM2 phase to act as the planning and tracking container for that phase's deliverables.

```
tool_call: create_version(project_id: "my-project", name: "Phase 1 — Initiating", startDate: "2026-04-01", endDate: "2026-04-30", description: "PM2 Initiating Phase: Project charter, stakeholder identification, feasibility confirmation.", status: "open")
tool_call: create_version(project_id: "my-project", name: "Phase 2 — Planning", startDate: "2026-05-01", endDate: "2026-06-30", description: "PM2 Planning Phase: Project work plan, risk register, resource plan, communications plan.", status: "open")
tool_call: create_version(project_id: "my-project", name: "Phase 3 — Executing", startDate: "2026-07-01", endDate: "2026-11-30", description: "PM2 Executing Phase: All project deliverables produced, monitored, and controlled.", status: "open")
tool_call: create_version(project_id: "my-project", name: "Phase 4 — Closing", startDate: "2026-12-01", endDate: "2026-12-31", description: "PM2 Closing Phase: Lessons learned, final reporting, project closure sign-off.", status: "open")
```

### Step 2: Create Phase Deliverable Work Packages
For each phase, create work packages representing the required PM2 deliverables.

```
tool_call: create_work_package(project_id: "my-project", subject: "Project Charter", type: "Task", version: {id: 101}, dueDate: "2026-04-15", description: "Produce the PM2 Project Charter document, including objectives, scope boundaries, success criteria, and initial risk identification.")
tool_call: create_work_package(project_id: "my-project", subject: "Stakeholder Identification Log", type: "Task", version: {id: 101}, dueDate: "2026-04-20")
tool_call: create_work_package(project_id: "my-project", subject: "Project Work Plan", type: "Task", version: {id: 102}, dueDate: "2026-06-15")
tool_call: create_work_package(project_id: "my-project", subject: "Risk Register", type: "Task", version: {id: 102}, dueDate: "2026-06-20")
```

Repeat for all required deliverables per phase.

### Step 3: Assign Deliverables to Phase Versions
If work packages were created without an explicit version, assign them now.

```
tool_call: update_work_package(id: 201, version: {id: 101})
```

### Step 4: Set Phase Gate Milestones
Create milestone work packages representing the formal phase gate review at the end of each phase.

```
tool_call: create_work_package(project_id: "my-project", subject: "Phase Gate 1 — Initiating Complete", type: "Milestone", dueDate: "2026-04-30", description: "Formal review confirming all Initiating Phase deliverables are approved by the Project Owner and Project Steering Committee.")
tool_call: create_work_package(project_id: "my-project", subject: "Phase Gate 2 — Planning Complete", type: "Milestone", dueDate: "2026-06-30")
tool_call: create_work_package(project_id: "my-project", subject: "Phase Gate 3 — Executing Complete", type: "Milestone", dueDate: "2026-11-30")
tool_call: create_work_package(project_id: "my-project", subject: "Phase Gate 4 — Project Closed", type: "Milestone", dueDate: "2026-12-31")
```

### Step 5: Define Phase Dependencies
Enforce sequential phase execution by linking milestones and first deliverables of subsequent phases.

```
tool_call: create_relation(from_id: 301, to_id: 201, type: "precedes")
```

Where 301 is the Phase Gate 1 milestone and 201 is the first deliverable of Phase 2 (Planning). Repeat to chain all phases sequentially.

### Step 6: Track Phase Progress
Monitor which deliverables within the current phase are complete, in progress, or overdue.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"version": {"operator": "=", "values": ["101"]}}])
```

### Step 7: Document Decisions
Log all significant project decisions with the decision-maker's name for the audit trail.

```
tool_call: log_decision(project_id: "my-project", decision: "Phase Gate 1 approved by Project Steering Committee on 2026-04-30. All Initiating Phase deliverables accepted. Authorization granted to proceed to Planning Phase.", decided_by: "Project Steering Committee Chair")
```

### Step 8: Phase Review Summary
Generate a summary at the end of each phase review.

```
tool_call: weekly_summary(project_id: "my-project")
```

Supplement with a manual comment on the milestone work package documenting the formal gate decision.

### Step 9: Close Completed Phase Work Packages
Mark all phase deliverables and the phase gate milestone as closed after formal approval.

```
tool_call: update_work_package_status(id: 201, status: "Closed")
tool_call: update_work_package_status(id: 301, status: "Closed")
```

Close all deliverables in the phase before closing the phase gate milestone.

## Data Flow
Phase Versions (containers) -> Deliverable Work Packages (phase outputs) -> Phase Gate Milestones (approval checkpoints) -> Relations (sequential phase dependencies) -> Decisions (governance log). Each phase version holds only the deliverables for that phase. The `precedes` relation between a phase gate milestone and the next phase's first deliverable enforces that the gate must close before the next phase begins.

## Tips & Pitfalls
- Create all four phase versions at project start, even though only Phase 1 will be active initially — this gives the full project timeline visibility from day one.
- Never skip the `log_decision` step at a phase gate — in PM2, phase gate decisions are mandatory governance artifacts. An undocumented gate approval is a compliance gap.
- Do not close a phase version until all its deliverable work packages and the phase gate milestone are closed; partial closure creates ambiguous audit trails.
- Use the `description` field on each deliverable work package to reference the PM2 handbook section that defines that deliverable's content requirements.
- PM2 requires a Lessons Learned Log — create a dedicated work package or document in the Closing phase to capture this; it is a mandatory PM2 output required for institutional knowledge management.
