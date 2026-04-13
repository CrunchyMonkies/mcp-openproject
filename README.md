# @crunchymonkies/mcp-openproject

A Model Context Protocol (MCP) server for [OpenProject](https://www.openproject.org/) project management. Provides 84 tools covering the full OpenProject API v3 surface — projects, work packages, time tracking, memberships, notifications, scheduling, and more.

## Features

- **Full API v3 coverage**: 84 tools across 26 resource domains
- **CRUD operations**: Create, read, update, and delete for projects, work packages, users, groups, memberships, versions, news, queries, views, and more
- **Transition-aware status changes**: Status updates respect allowed transitions
- **Time tracking**: Log, update, and query time entries
- **Scheduling support**: Working days, week days, and non-working day queries
- **Knowledge artifacts**: Generate weekly status summaries and decision log entries in markdown
- **Zod v4 schemas**: Fully typed API responses with runtime validation
- **Native TypeScript**: No Python dependency, uses Node.js built-in fetch

## Requirements

- Node.js 18+
- OpenProject instance with API v3 access
- API token with appropriate permissions

## Installation

### Using npx (no install needed)

```bash
OPENPROJECT_BASE_URL=https://openproject.example.org \
OPENPROJECT_API_TOKEN=your-api-token \
npx @crunchymonkies/mcp-openproject
```

### Global install

```bash
npm install -g @crunchymonkies/mcp-openproject
```

### From source

```bash
git clone https://github.com/CrunchyMonkies/mcp-openproject.git
cd mcp-openproject
npm install
npm run build
```

## Configuration

Set these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENPROJECT_BASE_URL` | Yes | OpenProject base URL (e.g., `https://openproject.example.org`) |
| `OPENPROJECT_API_TOKEN` | Yes | API token for authentication |
| `OPENPROJECT_DEFAULT_PROJECT` | No | Default project ID/identifier when `project` param is omitted |
| `OPENPROJECT_READ_ONLY` | No | Set to `true` to disable all write tools (create, update, delete) |

### Startup Behavior

On startup, the server automatically detects which OpenProject modules are enabled by querying the API root. Tools for disabled modules (time tracking, news, documents, budgets, versions, memberships, revisions, activities) are not registered. If detection fails, all tools are registered as a fallback.

When `OPENPROJECT_READ_ONLY=true`, all write tools (`create_*`, `update_*`, `delete_*`, `add_comment`, `execute_custom_action`, `mark_notification_read`) are excluded.

The server also performs per-project module checks at runtime — if a tool requires a module that is disabled for a specific project, a clear error is returned.

## MCP Integration

### Claude Code

Add to your Claude Code MCP settings (`~/.claude/settings.json` or project `.claude/settings.json`):

Using npx (recommended):

```json
{
  "mcpServers": {
    "openproject": {
      "command": "npx",
      "args": ["@crunchymonkies/mcp-openproject"],
      "env": {
        "OPENPROJECT_BASE_URL": "https://openproject.example.org",
        "OPENPROJECT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

Using a local clone:

```json
{
  "mcpServers": {
    "openproject": {
      "command": "node",
      "args": ["/path/to/mcp-openproject/dist/index.js"],
      "env": {
        "OPENPROJECT_BASE_URL": "https://openproject.example.org",
        "OPENPROJECT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "openproject": {
      "command": "npx",
      "args": ["@crunchymonkies/mcp-openproject"],
      "env": {
        "OPENPROJECT_BASE_URL": "https://openproject.example.org",
        "OPENPROJECT_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Other MCP Clients

Any MCP-compatible client can run the server via npx:

```bash
npx @crunchymonkies/mcp-openproject
```

Or point to the built entry point directly:

```bash
node /path/to/mcp-openproject/dist/index.js
```

## Tools (84)

### Projects (5)
| Tool | Description |
|------|-------------|
| `list_projects` | List all visible projects |
| `get_project` | Get details for a single project by ID |
| `create_project` | Create a new project |
| `update_project` | Update fields on an existing project |
| `delete_project` | Delete a project by ID |

### Work Packages (6)
| Tool | Description |
|------|-------------|
| `list_work_packages` | List work packages with optional filters |
| `get_work_package` | Get full details for a single work package |
| `create_work_package` | Create a new work package in a project |
| `update_work_package` | Update multiple fields on a work package |
| `update_work_package_status` | Update only the status (transition-aware) |
| `delete_work_package` | Delete a work package by ID |

### Comments (1)
| Tool | Description |
|------|-------------|
| `add_comment` | Add a comment/note to a work package |

### Users (5)
| Tool | Description |
|------|-------------|
| `list_users` | List visible users with optional name/login filter |
| `get_user` | Get details for a single user by ID |
| `create_user` | Create a new user account |
| `update_user` | Update fields on an existing user |
| `delete_user` | Delete a user by ID |

### Metadata (7)
| Tool | Description |
|------|-------------|
| `list_statuses` | List available work package statuses |
| `list_types` | List work package types (optionally project-scoped) |
| `list_priorities` | List available priorities |
| `list_roles` | List available roles |
| `get_role` | Get details for a single role by ID |
| `list_categories` | List categories for a project |
| `get_category` | Get details for a single category by ID |

### Relations (4)
| Tool | Description |
|------|-------------|
| `list_relations` | List relations for a work package |
| `create_relation` | Create a relation between two work packages |
| `get_relation` | Get details for a single relation by ID |
| `delete_relation` | Delete a relation by ID |

### Time Entries (5)
| Tool | Description |
|------|-------------|
| `list_time_entries` | List time entries with optional project/work package filters |
| `get_time_entry` | Get details for a single time entry by ID |
| `create_time_entry` | Log a time entry against a work package |
| `update_time_entry` | Update an existing time entry |
| `delete_time_entry` | Delete a time entry by ID |

### Versions (5)
| Tool | Description |
|------|-------------|
| `list_versions` | List versions for a project |
| `get_version` | Get details for a single version by ID |
| `create_version` | Create a new version in a project |
| `update_version` | Update an existing version |
| `delete_version` | Delete a version by ID |

### Activities (2)
| Tool | Description |
|------|-------------|
| `list_activities` | List activity journal entries for a work package |
| `get_activity` | Get details for a single activity by ID |

### Notifications (3)
| Tool | Description |
|------|-------------|
| `list_notifications` | List in-app notifications for the current user |
| `get_notification` | Get details for a single notification by ID |
| `mark_notification_read` | Mark a notification as read |

### Attachments (2)
| Tool | Description |
|------|-------------|
| `get_attachment` | Get details for a single attachment by ID |
| `delete_attachment` | Delete an attachment by ID |

### Memberships (5)
| Tool | Description |
|------|-------------|
| `list_memberships` | List memberships, optionally filtered by project |
| `get_membership` | Get details for a single membership by ID |
| `create_membership` | Create a new membership for a principal in a project |
| `update_membership` | Update roles for an existing membership |
| `delete_membership` | Delete a membership by ID |

### Groups (5)
| Tool | Description |
|------|-------------|
| `list_groups` | List all groups |
| `get_group` | Get details for a single group by ID |
| `create_group` | Create a new group |
| `update_group` | Update an existing group |
| `delete_group` | Delete a group by ID |

### News (5)
| Tool | Description |
|------|-------------|
| `list_news` | List news items, optionally filtered by project |
| `get_news` | Get details for a single news item by ID |
| `create_news` | Create a news item in a project |
| `update_news` | Update an existing news item |
| `delete_news` | Delete a news item by ID |

### Queries (5)
| Tool | Description |
|------|-------------|
| `list_queries` | List all saved queries |
| `get_query` | Get details for a single query by ID |
| `create_query` | Create a new saved query |
| `update_query` | Update an existing saved query |
| `delete_query` | Delete a saved query by ID |

### Documents (3)
| Tool | Description |
|------|-------------|
| `list_documents` | List documents, optionally filtered by project |
| `get_document` | Get details for a single document by ID |
| `update_document` | Update an existing document |

### Custom Actions (2)
| Tool | Description |
|------|-------------|
| `get_custom_action` | Get details for a single custom action by ID |
| `execute_custom_action` | Execute a custom action on a work package |

### Days (3)
| Tool | Description |
|------|-------------|
| `list_days` | List working days within a date range |
| `list_week_days` | List the configured week days |
| `list_non_working_days` | List all configured non-working days |

### File Links (3)
| Tool | Description |
|------|-------------|
| `list_file_links` | List file links for a work package |
| `get_file_link` | Get details for a single file link by ID |
| `delete_file_link` | Delete a file link by ID |

### Views (5)
| Tool | Description |
|------|-------------|
| `list_views` | List all views |
| `get_view` | Get details for a single view by ID |
| `create_view` | Create a new view from a saved query |
| `update_view` | Update an existing view |
| `delete_view` | Delete a view by ID |

### Schemas (2)
| Tool | Description |
|------|-------------|
| `get_work_package_schema` | Get the work package schema, optionally scoped to a project |
| `get_project_schema` | Get the project schema describing all project fields |

### Budgets (1)
| Tool | Description |
|------|-------------|
| `get_budget` | Get details for a single budget by ID |

### Revisions (2)
| Tool | Description |
|------|-------------|
| `list_revisions` | List revisions for a project |
| `get_revision` | Get details for a single revision by ID |

### Principals (1)
| Tool | Description |
|------|-------------|
| `list_principals` | List principals (users, groups, placeholder users) |

### Configuration (2)
| Tool | Description |
|------|-------------|
| `get_configuration` | Get the OpenProject instance configuration |
| `get_server_info` | Get OpenProject server information and API root |

### Knowledge Artifacts (2)
| Tool | Description |
|------|-------------|
| `weekly_summary` | Generate weekly status markdown |
| `log_decision` | Generate decision log entry markdown |

## Agent Skills

This package includes agent skills — reusable instruction sets that teach coding agents how to use the OpenProject MCP tools effectively. Skills are installed via [npx skills](https://github.com/vercel-labs/skills) and work across 45+ coding agents.

### Install skills

**List available skills:**

```bash
npx skills add CrunchyMonkies/mcp-openproject --list
```

**Install all skills (project-scoped):**

```bash
npx skills add CrunchyMonkies/mcp-openproject --all
```

**Install for a specific agent:**

```bash
npx skills add CrunchyMonkies/mcp-openproject --all -a claude-code
npx skills add CrunchyMonkies/mcp-openproject --all -a cursor
npx skills add CrunchyMonkies/mcp-openproject --all -a opencode
```

**Install globally (available across all projects):**

```bash
npx skills add CrunchyMonkies/mcp-openproject --all -g
```

**Install a specific skill only:**

```bash
npx skills add CrunchyMonkies/mcp-openproject --skill openproject-mcp
```

### What's included

The `skills/` directory contains detailed documentation organized by domain and workflow:

- `skills/openproject-mcp/SKILL.md` — Full tool index, installation reference, and navigation hub
- `skills/openproject-mcp/modules/` — 22 per-domain deep-dives: parameters, response shapes, and usage patterns for projects, work packages, time entries, users, memberships, queries, views, and more
- `skills/openproject-mcp/workflows/` — 16 step-by-step guides for common multi-tool scenarios: sprint planning, agile workflows, release management, stakeholder reporting, time and cost reporting, and more

These files are also plain markdown and can be read directly without installing.

## Development

```bash
# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Test tool listing
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

## License

MIT
