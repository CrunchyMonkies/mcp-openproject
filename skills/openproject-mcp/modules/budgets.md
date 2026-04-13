# Budgets

## Overview
The Budgets module allows project managers to define planned financial budgets for projects, tracking both labor costs (planned hours times hourly rates) and unit costs (quantities times unit cost rates). Budget overviews compare planned versus actual spending to identify variances early.

## Key Concepts
- **Planned Budget**: The anticipated total cost for a project, broken down into labor and unit cost components
- **Labor Budget**: Calculated from planned hours multiplied by user or global hourly rates
- **Unit Cost Budget**: Calculated from planned quantities multiplied by rates defined for each cost type
- **Actual Costs**: Sum of all time entries (labor) and cost entries (unit costs) recorded against the project's work packages
- **Budget Variance**: Difference between planned budget and actual costs, indicating over- or under-spending
- **Budget Overview**: Project-level view showing all budget line items with planned, actual, and variance columns

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `get_budget` — retrieve a specific budget's details including planned amounts and actual cost summary

## Common Operations

### Retrieve a Budget
1. Use `get_budget` with the `budget_id` to fetch the budget details
2. The response includes planned labor costs, planned unit costs, actual costs, and variance
3. Use this data to report on financial health of the project

### Monitor Budget Status
1. Use `get_budget` to retrieve current budget figures
2. Compare `actual_labor_costs` and `actual_unit_costs` against `planned_labor_costs` and `planned_unit_costs`
3. Calculate variance: variance = planned - actual (negative means over budget)

## Configuration
- Budgets module must be enabled per project in Project Settings > Modules
- The Cost Tracking module must also be active for actual cost tracking to function
- Hourly rates are configured per user via Administration > Users or set globally via Administration > Cost Types
- Unit cost rates are defined via Administration > Cost Types
- Only users with the appropriate role permissions can create or edit budgets

## Related Modules
- **Cost Tracking** — cost entries feed actual unit costs into budget comparison
- **Time Tracking** — time entries feed actual labor costs into budget comparison
- **Work Packages** — budgets are associated with projects containing the tracked work packages
- **Project Overview** — budget widgets can be displayed on the project overview dashboard
