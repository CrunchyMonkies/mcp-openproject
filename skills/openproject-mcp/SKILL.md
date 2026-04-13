---
name: openproject-mcp
description: OpenProject project management MCP server — 84 tools for work packages, time tracking, Gantt charts, boards, and more. Use when managing projects, sprints, scrum, or any OpenProject resource.
license: MIT
compatibility: Requires Node.js 18+ and an OpenProject instance with API v3 access
metadata:
  author: CrunchyMonkies
  version: "1.0.0"
---

# OpenProject MCP Server Skill

A full-featured MCP server for [OpenProject](https://www.openproject.org/) exposing 84 tools across projects, work packages, time tracking, users, groups, memberships, boards, queries, views, and more.

## Installation

### Claude Code (recommended — npx)

Add to `~/.claude/settings.json` or your project `.claude/settings.json`:

```json
{
  "mcpServers": {
    "openproject": {
      "command": "npx",
      "args": ["@crunchymonkies/mcp-openproject"],
      "env": {
        "OPENPROJECT_BASE_URL": "https://your-openproject.example.org",
        "OPENPROJECT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openproject": {
      "command": "npx",
      "args": ["@crunchymonkies/mcp-openproject"],
      "env": {
        "OPENPROJECT_BASE_URL": "https://your-openproject.example.org",
        "OPENPROJECT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Other MCP Clients

```bash
npx @crunchymonkies/mcp-openproject
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENPROJECT_BASE_URL` | Yes | OpenProject base URL |
| `OPENPROJECT_API_TOKEN` | Yes | API token for authentication |
| `OPENPROJECT_DEFAULT_PROJECT` | No | Default project ID/identifier |

---

## Tool Index

### Projects (5)
| Tool | Description |
|------|-------------|
| `list_projects` | List all visible projects |
| `get_project` | Get details for a single project |
| `create_project` | Create a new project |
| `update_project` | Update project fields |
| `delete_project` | Delete a project |

### Work Packages (6)
| Tool | Description |
|------|-------------|
| `list_work_packages` | List work packages with optional filters |
| `get_work_package` | Get full details for a single work package |
| `create_work_package` | Create a new work package |
| `update_work_package` | Update work package fields |
| `update_work_package_status` | Update only the status (transition-aware) |
| `delete_work_package` | Delete a work package |

### Comments (1)
| Tool | Description |
|------|-------------|
| `add_comment` | Add a comment to a work package |

### Metadata (7)
| Tool | Description |
|------|-------------|
| `list_statuses` | List available work package statuses |
| `list_types` | List work package types (optionally project-scoped) |
| `list_priorities` | List available priorities |
| `list_roles` | List all roles |
| `get_role` | Get details for a single role |
| `list_categories` | List categories for a project |
| `get_category` | Get details for a single category |

### Users (5)
| Tool | Description |
|------|-------------|
| `list_users` | List/filter visible users |
| `get_user` | Get details for a single user |
| `create_user` | Create a new user |
| `update_user` | Update user fields |
| `delete_user` | Delete a user |

### Relations (4)
| Tool | Description |
|------|-------------|
| `list_relations` | List relations for a work package |
| `create_relation` | Create a relation between work packages |
| `get_relation` | Get details for a single relation |
| `delete_relation` | Delete a relation |

### Knowledge (2)
| Tool | Description |
|------|-------------|
| `weekly_summary` | Generate weekly status markdown summary |
| `log_decision` | Generate a decision log entry in markdown |

### Time Entries (5)
| Tool | Description |
|------|-------------|
| `list_time_entries` | List time entries with optional filters |
| `get_time_entry` | Get details for a single time entry |
| `create_time_entry` | Create a new time entry |
| `update_time_entry` | Update a time entry |
| `delete_time_entry` | Delete a time entry |

### Versions (5)
| Tool | Description |
|------|-------------|
| `list_versions` | List versions for a project |
| `get_version` | Get details for a single version |
| `create_version` | Create a new version |
| `update_version` | Update a version |
| `delete_version` | Delete a version |

### Activities (2)
| Tool | Description |
|------|-------------|
| `list_activities` | List activities for a work package |
| `get_activity` | Get details for a single activity |

### Notifications (3)
| Tool | Description |
|------|-------------|
| `list_notifications` | List notifications for the current user |
| `get_notification` | Get details for a single notification |
| `mark_notification_read` | Mark a notification as read |

### Attachments (2)
| Tool | Description |
|------|-------------|
| `get_attachment` | Get details for a single attachment |
| `delete_attachment` | Delete an attachment |

### Memberships (5)
| Tool | Description |
|------|-------------|
| `list_memberships` | List project memberships |
| `get_membership` | Get details for a single membership |
| `create_membership` | Create a new project membership |
| `update_membership` | Update a membership (roles) |
| `delete_membership` | Delete a membership |

### Groups (5)
| Tool | Description |
|------|-------------|
| `list_groups` | List all groups |
| `get_group` | Get details for a single group |
| `create_group` | Create a new group |
| `update_group` | Update a group |
| `delete_group` | Delete a group |

### News (5)
| Tool | Description |
|------|-------------|
| `list_news` | List news items |
| `get_news` | Get details for a single news item |
| `create_news` | Create a news item |
| `update_news` | Update a news item |
| `delete_news` | Delete a news item |

### Queries (5)
| Tool | Description |
|------|-------------|
| `list_queries` | List saved queries |
| `get_query` | Get details for a single query |
| `create_query` | Create a new query |
| `update_query` | Update a query |
| `delete_query` | Delete a query |

### Documents (3)
| Tool | Description |
|------|-------------|
| `list_documents` | List documents for a project |
| `get_document` | Get details for a single document |
| `update_document` | Update a document |

### Custom Actions (2)
| Tool | Description |
|------|-------------|
| `get_custom_action` | Get details for a custom action |
| `execute_custom_action` | Execute a custom action on a work package |

### Days/Schedule (3)
| Tool | Description |
|------|-------------|
| `list_days` | List calendar days |
| `list_week_days` | List configured week days |
| `list_non_working_days` | List non-working days |

### File Links (3)
| Tool | Description |
|------|-------------|
| `list_file_links` | List file links for a work package |
| `get_file_link` | Get details for a single file link |
| `delete_file_link` | Delete a file link |

### Views (5)
| Tool | Description |
|------|-------------|
| `list_views` | List views |
| `get_view` | Get details for a single view |
| `create_view` | Create a new view |
| `update_view` | Update a view |
| `delete_view` | Delete a view |

### Schemas (2)
| Tool | Description |
|------|-------------|
| `get_work_package_schema` | Get the schema for work packages |
| `get_project_schema` | Get the schema for projects |

### Budgets (1)
| Tool | Description |
|------|-------------|
| `get_budget` | Get details for a project budget |

### Revisions (2)
| Tool | Description |
|------|-------------|
| `list_revisions` | List revisions for a project |
| `get_revision` | Get details for a single revision |

### Principals (1)
| Tool | Description |
|------|-------------|
| `list_principals` | List principals (users and groups) for a project |

### Configuration (2)
| Tool | Description |
|------|-------------|
| `get_configuration` | Get the OpenProject server configuration |
| `get_server_info` | Get server version and capabilities |

---

## Module Reference Index

Detailed module documentation lives in `modules/`. Each file covers the features, parameters, and usage patterns for a specific OpenProject domain.

| Module | Description |
|--------|-------------|
| `modules/activity.md` | Audit trail of changes, comments, @mentions, reactions |
| `modules/backlogs.md` | Scrum backlogs, sprint planning, story points, burndown |
| `modules/boards.md` | Kanban-style card views, basic and action boards |
| `modules/budgets.md` | Planned labor/unit costs, budget vs actual tracking |
| `modules/calendar.md` | Date-based visual view of scheduled work packages |
| `modules/cost-tracking.md` | Unit cost entries linked to work packages |
| `modules/documents.md` | Document upload, organization, and categorization |
| `modules/file-storage.md` | Attachments and cloud storage integrations (Nextcloud, OneDrive, SharePoint) |
| `modules/forums.md` | Threaded project discussions, sticky/locked topics |
| `modules/gantt-charts.md` | Timeline visualization, dependencies, auto/manual scheduling |
| `modules/meetings.md` | Meeting planning, agendas, attendees, action items |
| `modules/members.md` | Project access, roles, groups, user status |
| `modules/news.md` | Project announcements and email notifications |
| `modules/notifications.md` | In-app alerts, notification center, read state |
| `modules/portfolios.md` | Multi-project overview for program/portfolio managers |
| `modules/project-overview.md` | Configurable dashboard with widget-based layout |
| `modules/repository.md` | Git/SVN integration, changesets, commit-to-WP links |
| `modules/team-planner.md` | Calendar-based resource planning per assignee (Enterprise) |
| `modules/time-tracking.md` | Time logging, activity types, effort vs estimates |
| `modules/versions.md` | Release/sprint planning, roadmap view, progress bars |
| `modules/wiki.md` | Collaborative documentation, WYSIWYG, hierarchical pages |
| `modules/work-packages.md` | Core WP lifecycle, types, custom fields, attributes |

---

## Workflow Guide Index

Step-by-step workflow documentation lives in `workflows/`. Each file covers a common multi-tool scenario.

| Workflow | Description |
|----------|-------------|
| `workflows/agile-workflow.md` | Flow-based Kanban delivery without fixed sprints |
| `workflows/document-collaboration.md` | Documentation management and review coordination |
| `workflows/issue-tracking-lifecycle.md` | Bug/issue from creation through triage to resolution |
| `workflows/meeting-management.md` | Meeting action items, outcomes, and follow-up tracking |
| `workflows/okr-management.md` | Quarterly OKRs with linked delivery work |
| `workflows/pm2-pmflex.md` | EU public sector PM2/PMflex methodology with phase gates |
| `workflows/portfolio-management.md` | Cross-project visibility for program managers |
| `workflows/project-setup.md` | New project initialization with team and backlog |
| `workflows/release-management.md` | Release scoping through delivery coordination |
| `workflows/safe-framework.md` | Scaled Agile Framework for multi-team programs |
| `workflows/sprint-planning.md` | Scrum sprint setup, assignment, and tracking |
| `workflows/stakeholder-reporting.md` | Progress reports for sponsors, clients, management |
| `workflows/team-workload-management.md` | Workload balancing and over-allocation detection |
| `workflows/test-management.md` | Test cases and execution cycles via custom WP types |
| `workflows/time-and-cost-reporting.md` | Budget visibility, invoicing support, overrun detection |
| `workflows/waterfall-workflow.md` | Sequential phases, milestones, baseline tracking |
