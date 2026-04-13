# News

## Overview
The News module provides a project announcement mechanism, allowing project managers to publish news items visible to all project members. News entries consist of a title, summary, and full description, and are displayed in chronological order. Email notifications can be sent to project members when news is published.

## Key Concepts
- **News Item**: An announcement with a title, short summary, and optional full description body
- **Chronological Listing**: News items are displayed newest-first in the project news section
- **Email Notifications**: Project members can receive email notifications when new items are published, based on their notification settings
- **Project Overview Widget**: News items can be displayed on the project overview dashboard via a news widget

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_news` — retrieve all news items for a project in reverse chronological order
- `get_news` — fetch details of a single news item by ID
- `create_news` — publish a new news item to a project
- `update_news` — modify an existing news item's title, summary, or description
- `delete_news` — remove a news item permanently

## Common Operations

### Publish a News Announcement
1. Use `create_news` with `project_id`, `title`, `summary`, and optionally `description` (supports Markdown)
2. The news item is immediately visible to all project members with access to the News section
3. Members with news notifications enabled receive an email digest

### List Recent News
1. Use `list_news` with `project_id` to retrieve all news items for the project
2. Results are ordered newest-first; use `pageSize` and `offset` for pagination
3. Display `title` and `summary` for a compact news feed view

### Update an Existing News Item
1. Use `get_news` to retrieve the current content
2. Use `update_news` with `news_id` and the fields to modify (`title`, `summary`, `description`)
3. Changes are reflected immediately in the project news section

### Delete a News Item
1. Use `delete_news` with `news_id` to permanently remove the announcement
2. Deleted news items are not recoverable through the API

## Configuration
- News module must be enabled per project in Project Settings > Modules
- Email notification for news is configurable per user in their notification preferences
- Role permissions control who can create, edit, and delete news items
- The News widget can be added to the Project Overview dashboard

## Related Modules
- **Project Overview** — news widget displays recent news items on the project dashboard
- **Notifications** — project members receive in-app and email notifications for new news items
- **Activity** — news creation and updates appear in the project activity feed
- **Members** — news is visible to all project members; membership controls access
