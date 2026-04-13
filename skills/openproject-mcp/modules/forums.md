# Forums

## Overview
The Forums module enables threaded discussions within projects, providing a space for team members to raise topics, ask questions, and collaborate asynchronously. Forums support sticky and locked topics for pinning important discussions and preventing further replies when a topic is resolved.

## Key Concepts
- **Forum**: A named discussion area within a project (a project can have multiple forums)
- **Topic**: A discussion thread within a forum, started by a project member with a subject and initial message
- **Reply**: A threaded response to a topic, building a conversation history
- **Sticky Topic**: A topic pinned to the top of the forum listing regardless of activity date
- **Locked Topic**: A topic where further replies are disabled, typically used to close resolved discussions
- **Subscription**: Users can subscribe to forums or topics to receive email notifications of new replies

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
Forums are not directly exposed via MCP API tools — forum topics and replies are created and managed through the OpenProject web UI.

## Common Operations

### Create a Forum Topic (UI)
1. Navigate to the project's Forums section in the sidebar
2. Select the appropriate forum or create a new one
3. Click "New topic", enter a subject and message body
4. Click "Create" to publish the topic for all project members to see

### Reply to a Topic (UI)
1. Open the forum topic
2. Scroll to the reply form at the bottom
3. Enter the reply text and click "Submit"

### Sticky a Topic (UI)
1. Open the topic and click the "Sticky" toggle (requires moderator permissions)
2. The topic moves to the top of the forum listing and remains there regardless of new activity

### Lock a Topic (UI)
1. Open the topic and click the "Locked" toggle (requires moderator permissions)
2. The reply form is hidden for all users; no further replies can be added

## Configuration
- Forums module must be enabled per project in Project Settings > Modules
- Multiple forums can be created per project to separate discussion areas by topic
- Role permissions control who can create topics, reply, and moderate (sticky/lock) topics
- Email notification subscriptions are configurable per user per forum or topic

## Related Modules
- **News** — for one-way announcements to project members; Forums enable two-way discussion
- **Wiki** — for persistent structured documentation; Forums suit ephemeral threaded discussion
- **Notifications** — forum activity can trigger in-app and email notifications for subscribers
- **Members** — forum access is limited to project members based on role permissions
