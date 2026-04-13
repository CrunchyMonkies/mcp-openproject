# Waterfall Workflow

## Goal
Manage a traditional waterfall project with sequential phases, formal milestones, and baseline-versus-actual schedule tracking. Use this workflow for projects with fixed scope, regulated deliverables, or contractual phase gates.

## Prerequisites
- Gantt module enabled
- Work Packages module enabled
- Relations module enabled
- Time Tracking module enabled (optional)
- Role with permissions to create work packages, relations, and versions

## Modules Involved
- **Gantt** — visualizes the full project schedule with dependencies
- **Work Packages** — phases, milestones, and tasks
- **Relations** — enforces sequencing between phases and tasks
- **Versions** — optionally used to tag deliverables to phases

## Process

### Step 1: Create Project Phases
Create top-level work packages of type Phase to represent each waterfall stage.

```
tool_call: create_work_package(project_id: "my-project", subject: "Requirements", type: "Phase", startDate: "2026-04-01", dueDate: "2026-04-30")
tool_call: create_work_package(project_id: "my-project", subject: "Design", type: "Phase", startDate: "2026-05-01", dueDate: "2026-05-31")
tool_call: create_work_package(project_id: "my-project", subject: "Implementation", type: "Phase", startDate: "2026-06-01", dueDate: "2026-08-31")
tool_call: create_work_package(project_id: "my-project", subject: "Testing", type: "Phase", startDate: "2026-09-01", dueDate: "2026-09-30")
tool_call: create_work_package(project_id: "my-project", subject: "Deployment", type: "Phase", startDate: "2026-10-01", dueDate: "2026-10-15")
```

### Step 2: Create Phase Gate Milestones
Add a milestone at the end of each phase to mark formal sign-off.

```
tool_call: create_work_package(project_id: "my-project", subject: "Requirements Sign-Off", type: "Milestone", dueDate: "2026-04-30")
```

Repeat for each phase gate.

### Step 3: Create Tasks Under Each Phase
Break each phase into deliverable tasks, parented to the phase work package.

```
tool_call: create_work_package(project_id: "my-project", subject: "Stakeholder interviews", type: "Task", parent: {id: 201}, startDate: "2026-04-01", dueDate: "2026-04-10")
```

### Step 4: Set Date Dependencies
Link phases and tasks so the Gantt reflects the intended sequence.

```
tool_call: create_relation(from_id: 201, to_id: 202, type: "precedes")
```

Link each phase to the next: Requirements precedes Design, Design precedes Implementation, etc.

### Step 5: Assign Resources
Set assignees on tasks so the Gantt shows who is responsible for each item.

```
tool_call: update_work_package(id: 301, assignee: {id: 7})
```

### Step 6: Track Dates and Progress
Regularly check the schedule for upcoming and overdue items.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"dueDate": {"operator": "<t+", "values": ["7"]}}])
tool_call: get_work_package(id: 201)
```

### Step 7: Monitor Critical Path via Gantt
Use the Gantt view in the OpenProject UI to visualize the critical path. The dependency relations created in Step 4 drive this view. No tool call needed — navigate to the project Gantt in the browser.

### Step 8: Log Time
Record effort spent on tasks throughout the project.

```
tool_call: create_time_entry(project_id: "my-project", work_package_id: 301, hours: 4.0, spent_on: "2026-04-05", comment: "Conducted stakeholder interviews")
```

### Step 9: Compare Baseline for Schedule Variance
Use the baseline comparison feature in the Gantt UI (if enabled) to compare current dates against the original plan. Set the baseline at project kickoff using the UI snapshot feature — no direct tool call is available for baseline management; track variance manually by comparing original `startDate`/`dueDate` against current values from `get_work_package`.

## Data Flow
Phases (parent WPs) -> Tasks (child WPs) -> Time Entries (effort). Milestones are standalone WPs linked by `precedes` relations to the tasks that must complete before sign-off. The Gantt view reads `startDate`, `dueDate`, and `precedes` relations to render the schedule.

## Tips & Pitfalls
- Always set both `startDate` and `dueDate` on phase and task work packages; the Gantt cannot render bars without both values.
- Create `precedes` relations between the last task of a phase and the milestone, and between the milestone and the first task of the next phase — this gives accurate critical path calculation.
- Do not skip creating milestone work packages; they are the formal phase gates that stakeholders use to verify completion before authorizing the next phase.
- Reassigning a task's `dueDate` without updating related `precedes` constraints will create invisible schedule conflicts — always update the relation after moving dates.
- For regulated projects, take a screenshot or export of the Gantt at each phase gate as a baseline artifact before modifying any dates.
