# mcp-openproject

A Model Context Protocol (MCP) server for [OpenProject](https://www.openproject.org/) project management. Provides 15 tools for managing projects, work packages, statuses, relations, and generating knowledge artifacts.

## Features

- **Project management**: List projects, work packages, statuses, types, priorities, users
- **Work package operations**: Create, update, comment on work packages with transition-aware status changes
- **Relations**: Create and list work package dependencies (blocks, follows, relates, etc.)
- **Knowledge artifacts**: Generate weekly status summaries and decision log entries in markdown
- **Native TypeScript**: No Python dependency, uses Node.js built-in fetch

## Requirements

- Node.js 18+
- OpenProject instance with API v3 access
- API token with appropriate permissions

## Installation

```bash
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

## Usage with Claude Code

Add to your Claude Code MCP settings (`~/.claude/settings.json` or project `.claude/settings.json`):

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

## Usage with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

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

## Tools

### Project & Metadata
| Tool | Description |
|------|-------------|
| `list_projects` | List visible projects |
| `list_statuses` | List available work package statuses |
| `list_types` | List work package types (optionally project-scoped) |
| `list_priorities` | List available priorities |
| `list_users` | List/filter visible users |

### Work Packages
| Tool | Description |
|------|-------------|
| `list_work_packages` | List work packages with optional filters |
| `get_work_package` | Get full details for a single work package |
| `create_work_package` | Create a new work package |
| `update_work_package` | Update work package fields |
| `update_work_package_status` | Update only the status (transition-aware) |
| `add_comment` | Add a comment to a work package |

### Relations
| Tool | Description |
|------|-------------|
| `list_relations` | List relations for a work package |
| `create_relation` | Create a relation between work packages |

### Knowledge Artifacts
| Tool | Description |
|------|-------------|
| `weekly_summary` | Generate weekly status markdown |
| `log_decision` | Generate decision log entry markdown |

## Development

```bash
# Run in development mode
npm run dev

# Build
npm run build

# Test tool listing
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

## License

MIT
