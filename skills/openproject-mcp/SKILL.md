---
name: openproject-mcp
description: OpenProject project management MCP server — 91 tools for work packages, time tracking, Gantt charts, boards, and more
triggers:
  - openproject
  - project management
  - work packages
  - gantt
  - scrum
  - time tracking
argument-hint: "<command>"
---

# OpenProject MCP Server Skill

A full-featured MCP server for [OpenProject](https://www.openproject.org/) exposing 91 tools across projects, work packages, time tracking, users, groups, memberships, boards, queries, views, and more.

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

Detailed module documentation lives in `modules/`. Each file covers the tools, parameters, response shapes, and usage patterns for a specific domain.

| Module | Description |
|--------|-------------|
| `modules/projects.md` | Project CRUD, identifiers, status, and custom fields |
| `modules/work-packages.md` | Work package lifecycle, filters, transitions, and bulk ops |
| `modules/time-entries.md` | Time logging, activity types, and reporting |
| `modules/users-groups.md` | User management, group membership, and principal lookup |
| `modules/memberships.md` | Project membership roles and access control |
| `modules/relations.md` | Dependency types, lag, and relation graph traversal |
| `modules/versions.md` | Sprint/milestone versioning and date ranges |
| `modules/queries.md` | Saved filters, sorting, and column configuration |
| `modules/views.md` | Board, Gantt, team planner, and calendar views |
| `modules/notifications.md` | User notification inbox and read state |
| `modules/attachments.md` | File attachment retrieval and cleanup |
| `modules/file-links.md` | External file storage links |
| `modules/news.md` | Project news and announcements |
| `modules/documents.md` | Document storage per project |
| `modules/activities.md` | Work package audit trail and journal |
| `modules/revisions.md` | Source control revision references |
| `modules/budgets.md` | Project budget tracking |
| `modules/metadata.md` | Statuses, types, priorities, roles, categories, schemas |
| `modules/schedule.md` | Working days, non-working days, and calendar config |
| `modules/configuration.md` | Server configuration and capability discovery |
| `modules/knowledge.md` | AI-generated weekly summaries and decision logs |

---

## Workflow Guide Index

Step-by-step workflow documentation lives in `workflows/`. Each file covers a common multi-tool scenario.

| Workflow | Description |
|----------|-------------|
| `workflows/sprint-planning.md` | Set up a version, create work packages, assign members |
| `workflows/status-reporting.md` | Generate weekly summaries and decision logs |
| `workflows/onboarding-project.md` | Create project, configure memberships and categories |
| `workflows/time-tracking.md` | Log, review, and update time entries for a work package |
| `workflows/dependency-mapping.md` | Map blockers and follows chains across work packages |
| `workflows/board-setup.md` | Create and configure Kanban/Scrum board views |
| `workflows/gantt-scheduling.md` | Schedule work packages with versions and date constraints |
| `workflows/user-management.md` | Create users, assign groups, and manage project access |
| `workflows/query-reporting.md` | Build and save filtered queries for recurring reports |
| `workflows/notification-triage.md` | Process and clear the notification inbox |
