# Test Management

## Goal
Manage test cases and test execution cycles using custom work package types within OpenProject. Use this workflow when your instance has TestCase and TestRun work package types configured, or when you want to track testing activities alongside development work.

## Prerequisites
- Work Packages module enabled
- Custom work package types configured: TestCase and TestRun (configured by an administrator)
- Relations module enabled (for linking test cases to features)
- Role with permissions to create/edit work packages and relations

## Modules Involved
- **Work Packages** — test cases (specifications) and test runs (execution records)
- **Relations** — links test cases to features and test runs to test cases
- **Activity** — audit trail of test execution and result updates

## Process

### Step 1: Check Available Work Package Types
Verify that TestCase and TestRun types exist before attempting to create them.

```
tool_call: list_types(project_id: "my-project")
```

If TestCase or TestRun types are not present, ask an administrator to create them via Administration -> Work Package Types. Alternatively, use Task or Feature types as substitutes and prefix the subject with "TC:" or "TR:".

### Step 2: Create Test Case Work Packages
Define test cases as work packages with preconditions, steps, and expected results in the description.

```
tool_call: create_work_package(project_id: "my-project", subject: "TC-001: Verify SSO login with valid credentials", type: "TestCase", description: "**Preconditions:** SSO provider configured, test user account exists\n\n**Steps:**\n1. Navigate to login page\n2. Click 'Sign in with SSO'\n3. Enter valid credentials at SSO provider\n4. Confirm redirect back to application\n\n**Expected Result:** User is logged in and redirected to dashboard")
```

### Step 3: Create Test Run Work Packages
Create a test run to represent a specific execution of a set of test cases (e.g., for a release or sprint).

```
tool_call: create_work_package(project_id: "my-project", subject: "TR-001: Sprint 12 Regression Test Run", type: "TestRun", description: "Regression test run for Sprint 12 release candidate. Target: v2.0.0-rc1. Environment: Staging.", startDate: "2026-04-22", dueDate: "2026-04-24")
```

### Step 4: Link Test Runs to Test Cases
Associate which test cases are included in each test run.

```
tool_call: create_relation(from_id: 601, to_id: 501, type: "relates")
tool_call: create_relation(from_id: 601, to_id: 502, type: "relates")
tool_call: create_relation(from_id: 601, to_id: 503, type: "relates")
```

Where 601 is the TestRun WP and 501-503 are TestCase WPs.

### Step 5: Link Test Cases to Features
Connect test cases to the features they verify for traceability.

```
tool_call: create_relation(from_id: 501, to_id: 301, type: "relates")
```

Where 501 is the TestCase WP and 301 is the Feature WP being tested.

### Step 6: Execute Tests and Update Status
As each test case is executed within a test run, update its status to reflect the result.

For a passed test:
```
tool_call: update_work_package_status(id: 501, status: "Closed")
```

For a failed test:
```
tool_call: update_work_package_status(id: 502, status: "Rejected")
```

When a failure is found, create a bug work package and link it:
```
tool_call: create_work_package(project_id: "my-project", subject: "BUG: SSO login fails with special characters in username", type: "Bug", priority: "High")
tool_call: create_relation(from_id: 502, to_id: 701, type: "relates")
```

### Step 7: Log Test Results as Comments
Document the actual result and environment details on each executed test case.

```
tool_call: add_comment(work_package_id: 502, comment: "FAIL — 2026-04-22, tester: @alice, environment: staging v2.0.0-rc1\nActual result: SSO login returns 400 Bad Request when username contains '+' character. Bug logged as #701.")
```

### Step 8: Track Test Coverage
List all test cases to review coverage status against the feature set.

```
tool_call: list_work_packages(project_id: "my-project", filters: [{"type": {"operator": "=", "values": ["TestCase"]}}])
```

Cross-reference against feature work packages to identify untested features.

## Data Flow
Features (what is being built) <- linked via `relates` -> TestCases (how it will be verified) <- linked via `relates` -> TestRuns (when it was executed). Bug WPs are created from failed test cases and linked back. The relation graph provides full traceability from requirement to test result to defect.

## Tips & Pitfalls
- If TestCase and TestRun types do not exist, do not try to use the wrong type — the workflow statuses and custom fields will not match. Use prefixed Task types as a fallback but note the limitations.
- Create test cases before the test run begins, not during execution — pre-defined test cases allow proper planning of test scope and duration.
- Always link a failed test case to the bug it produced; without this link, the defect appears disconnected from the test evidence.
- Use the `add_comment` step religiously during execution — test result comments are the evidence that QA was performed and must be present for any audited release process.
- When a test run is complete, close the TestRun work package with a summary comment stating how many tests passed, failed, and were skipped.
