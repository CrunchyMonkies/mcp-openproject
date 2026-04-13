# Cost Tracking

## Overview
Cost Tracking enables projects to record and monitor unit costs associated with work packages, complementing time-based labor costs with material and custom unit cost entries. Cost entries are linked directly to work packages and are visible in cost reports alongside time tracking data.

## Key Concepts
- **Cost Types**: Categories of costs such as labor costs, material costs, and custom unit costs defined by administrators
- **Unit Costs**: Costs defined by a quantity and a rate per unit (e.g., 5 licenses at $100/unit = $500)
- **Labor Costs**: Derived from time entries multiplied by user hourly rates; not entered separately
- **Cost Entries**: Records linking a cost type, quantity, and work package together
- **Cost Reports**: Filterable reports aggregating all cost entries by project, work package, user, or cost type
- **Budget Integration**: Actual costs from cost entries are compared against planned budget amounts

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_time_entries` — retrieve time entries that contribute to labor cost calculations visible in work package cost details
- `get_work_package` — fetch work package details including associated cost summary information

## Common Operations

### View Costs for a Work Package
1. Use `get_work_package` with the `work_package_id` to retrieve the work package details
2. The response includes a summary of logged time and associated costs when the Cost Tracking module is active
3. For detailed cost breakdowns, use `list_time_entries` filtered by `work_package_id`

### Retrieve Time Entries Contributing to Labor Cost
1. Use `list_time_entries` with `work_package_id` to get all time entries for the work package
2. Each entry's `hours` value multiplied by the user's hourly rate yields the labor cost contribution
3. Aggregate across entries for total labor cost

### List Time Entries by Date Range for Cost Reporting
1. Use `list_time_entries` with `from` and `to` date filters to scope a billing or reporting period
2. Filter by `project_id` to limit to a specific project
3. Use the results to calculate total costs per project or work package

## Configuration
- Cost Tracking module must be enabled per project in Project Settings > Modules
- Cost types are defined globally via Administration > Cost Types
- Hourly rates for labor cost calculation are set per user via Administration > Users or globally
- The Costs module requires the Time Tracking module to be active for labor cost calculations
- Budget module should also be enabled to compare actuals against planned budgets

## Related Modules
- **Time Tracking** — time entries form the basis of labor cost calculations
- **Budgets** — cost entries are measured against planned budget amounts for variance analysis
- **Work Packages** — all cost entries are associated with specific work packages
- **Activity** — cost entry creation appears in the work package activity feed
