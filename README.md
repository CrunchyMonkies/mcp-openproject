# @crunchymonkies/mcp-openproject

A Model Context Protocol (MCP) server for [OpenProject](https://www.openproject.org/) project management. Provides 91 tools for managing projects, work packages, statuses, relations, and generating knowledge artifacts.

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

### Using npx (no install needed)

Run directly without installing:

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
git clone https://github.com/your-org/mcp-openproject.git
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

## Skill Reference

The `skills/` directory contains detailed documentation organized by domain and workflow:

- `skills/openproject-mcp/SKILL.md` — Full tool index (91 tools), installation reference, and navigation hub
- `skills/openproject-mcp/modules/` — Per-domain deep-dives: parameters, response shapes, and usage patterns for projects, work packages, time entries, users, memberships, queries, views, and more
- `skills/openproject-mcp/workflows/` — Step-by-step guides for common multi-tool scenarios: sprint planning, status reporting, onboarding, time tracking, Gantt scheduling, and more

These files are designed for use with [oh-my-claudecode](https://github.com/ccddan/oh-my-claudecode) skill loading, but are plain markdown and readable directly.

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
