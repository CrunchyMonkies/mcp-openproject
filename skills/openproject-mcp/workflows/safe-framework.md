# SAFe Framework

## Goal
Implement the Scaled Agile Framework (SAFe) using OpenProject to manage portfolio epics, features, user stories, and Program Increments across multiple teams. Use this workflow for large programs with 3 or more teams delivering toward shared objectives.

## Prerequisites
- Work Packages module enabled
- Backlogs module enabled (for story-level planning)
- Versions module enabled (for Program Increment planning)
- Relations module enabled (for cross-team dependencies)
- Boards module enabled (for team-level Kanban views)
- Role with permissions to create/edit work packages, versions, and relations across projects

## Modules Involved
- **Work Packages** — epics (portfolio), features (program), and user stories (team)
- **Boards** — team-level Kanban boards for sprint execution
- **Backlogs** — story management and sprint assignment per team
- **Versions** — Program Increments (PIs) as version containers
- **Relations** — cross-team dependencies and epic-to-feature breakdowns

## Process

### Step 1: Create Portfolio-Level Epics
Define large business initiatives at the portfolio level as Epic work packages.

```
tool_call: create_work_package(project_id: "portfolio", subject: "Epic: Unified Customer Data Platform", type: "Epic", description: "Enable a single source of truth for customer data across all product lines. Expected business value: 30% reduction in data reconciliation overhead. Horizon: 4 PIs.", startDate: "2026-04-01", dueDate: "2026-12-31")
```

### Step 2: Break Epics into Features
Decompose each epic into features sized for delivery within one or two Program Increments.

```
tool_call: create_work_package(project_id: "portfolio", subject: "Feature: Customer profile API v2", type: "Feature", parent: {id: 601}, description: "Expose unified customer profile via versioned REST API. Acceptance: API contract published, latency <100ms p99, security review passed.", startDate: "2026-04-01", dueDate: "2026-06-30")
```

Repeat for each feature under the epic.

### Step 3: Break Features into User Stories
Within each team's project, create user stories sized for individual sprints, parented to the feature.

```
tool_call: create_work_package(project_id: "team-alpha", subject: "As a mobile app, I can retrieve the unified customer profile in a single API call", type: "UserStory", parent: {id: 602}, storyPoints: 8)
```

### Step 4: Plan Program Increments as Versions
Create a version for each PI, spanning approximately 10-12 weeks (5 sprints).

```
tool_call: create_version(project_id: "portfolio", name: "PI 3 — Q2 2026", startDate: "2026-04-01", endDate: "2026-06-27", description: "Program Increment 3: Focus on customer data platform features and API surface stabilization.")
```

Create corresponding sprint versions within each team's project:

```
tool_call: create_version(project_id: "team-alpha", name: "PI3 Sprint 1", startDate: "2026-04-01", endDate: "2026-04-14")
```

### Step 5: Assign Stories to PI Versions
Place user stories into the appropriate PI and sprint versions.

```
tool_call: update_work_package(id: 701, version: {id: 52})
```

### Step 6: Set Cross-Team Dependencies
Identify and formalize dependencies between teams using relations.

```
tool_call: create_relation(from_id: 701, to_id: 805, type: "blocks")
```

Where WP 701 (Team Alpha story) must complete before WP 805 (Team Beta story) can begin. Document the dependency in a comment:

```
tool_call: add_comment(work_package_id: 805, comment: "Dependency on Team Alpha #701: Customer Profile API must be deployed to staging before Team Beta can begin integration testing. PI3 Sprint 2 target.")
```

### Step 7: Track PI Progress
Monitor delivery against the PI plan by reviewing version completion and open stories.

```
tool_call: list_work_packages(project_id: "team-alpha", filters: [{"version": {"operator": "=", "values": ["52"]}}, {"status": {"operator": "o", "values": []}}])
tool_call: get_version(id: 52)
```

Repeat for each team's PI version.

### Step 8: Review via Summary
Generate a program-level summary at regular intervals (typically end of each sprint/IP sprint).

```
tool_call: weekly_summary(project_id: "portfolio")
tool_call: weekly_summary(project_id: "team-alpha")
tool_call: weekly_summary(project_id: "team-beta")
```

## Data Flow
Portfolio Epics -> Program Features (children of Epics) -> Team User Stories (children of Features, held in team projects) -> Sprint Versions (time boxes within each PI). Cross-team Relations create a dependency graph visible across projects. The PI Version ties all team stories to the program cadence.

## Tips & Pitfalls
- Maintain the Epic -> Feature -> Story hierarchy strictly; flattening it loses the traceability that SAFe's portfolio management depends on.
- Use a dedicated "portfolio" project to hold Epics and Features; team-level stories live in each team's own project. This prevents one team's project from becoming a monolith.
- Create PI versions before PI planning events — teams need the version containers to exist before they can assign stories during PI planning.
- The `blocks` relation is the correct type for cross-team dependencies with delivery sequencing implications; `relates` is for informational links without scheduling impact.
- At PI boundaries, do not close the PI version until all features planned for the PI are either closed or explicitly moved to the next PI — this preserves accurate velocity and predictability data.
