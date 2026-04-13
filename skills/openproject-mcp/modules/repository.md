# Repository

## Overview
The Repository module integrates Git and Subversion (SVN) source code repositories with OpenProject projects, enabling teams to browse code, view changesets, and link commits to work packages. This creates traceability between code changes and the work packages that drove them.

## Key Concepts
- **Repository**: A Git or SVN repository connected to an OpenProject project
- **Changeset**: A commit or revision in the connected repository, visible within OpenProject
- **Work Package Linking**: Reference a work package in a commit message (e.g., `Fixes #42`) to automatically link the changeset to that work package
- **Code Browse**: Navigate repository file tree and view file contents directly within OpenProject
- **Revision**: A specific commit/changeset identified by hash (Git) or revision number (SVN)
- **Repository Module Activation**: Each project must have the repository module enabled and a repository configured

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_revisions` — retrieve a list of changesets/revisions for a project's connected repository
- `get_revision` — fetch details of a single revision including commit message, author, date, and linked work packages

## Common Operations

### List Recent Revisions for a Project
1. Use `list_revisions` with `project_id` to retrieve recent commits from the connected repository
2. The response includes revision identifier, commit message, author, and timestamp
3. Use `pageSize` and `offset` for pagination through the revision history

### Get Revision Details
1. Use `get_revision` with `revision_id` to fetch full details of a specific commit
2. The response includes the full commit message, author, committer, date, and any linked work packages
3. Linked work packages are those referenced in the commit message using the `#WP_ID` syntax

### Find Commits Linked to a Work Package
1. Use `list_revisions` with `project_id` and filter or search for revisions mentioning the work package ID
2. Alternatively, use `get_work_package` to retrieve the work package — linked revisions are included in its relations

### Browse Repository History by Date
1. Use `list_revisions` with date filters to retrieve commits within a specific time period
2. Use this to audit changes made during a sprint or release window

## Configuration
- Repository module must be enabled per project in Project Settings > Modules
- A repository must be connected in Project Settings > Repository after enabling the module
- Git repositories can be connected via URL (HTTP/HTTPS/SSH); SVN repositories similarly
- Work package linking via commit messages requires the repository to be fetched/synced by OpenProject
- The `refs_download` setting controls which branches/tags are tracked
- Permissions for repository access are role-based; the "Browse repository" permission must be granted

## Related Modules
- **Work Packages** — commit messages can reference work packages to create changeset links for traceability
- **Activity** — repository commits linked to work packages may appear in the project activity feed
- **Members** — repository access is controlled by project membership and role permissions
