# Notifications

## Overview
OpenProject's Notifications module delivers in-app alerts for relevant project activity, reducing reliance on email for staying current. A bell icon with a red badge counter (capped at 99+) indicates unread notifications, and the Notification Center provides a grouped list of work packages with unread activity.

## Key Concepts
- **Bell Icon**: Global notification indicator in the top navigation; badge shows unread count (caps at 99+)
- **Notification Center**: Full list of work packages with unread notifications; click a work package to open split-screen activity view
- **Notification Reasons**: The triggering event that caused the notification:
  - **@mention**: User was mentioned in a comment or description
  - **Assignee/Accountable**: User is the work package assignee or accountable person
  - **Watcher**: User is watching the work package
  - **Reminder**: User set a manual reminder on the work package
  - **Date Alert**: Work package start or due date is approaching or overdue
- **Auto-Scroll**: Opening a notification scrolls the activity pane to the triggering event
- **Filters**: Filter notifications by reason, project, or read/unread status
- **Daily Email Digest**: Summary email of all unread notifications from the previous day (configurable per user)
- **Per-User Settings**: Each user configures which notification reasons they want to receive

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_notifications` — retrieve the current user's unread notifications with filtering options
- `get_notification` — fetch details of a single notification including its reason and associated work package
- `mark_notification_read` — mark one or more notifications as read to clear the unread badge

## Common Operations

### Retrieve Unread Notifications
1. Use `list_notifications` to fetch all unread notifications for the current user
2. Filter by `reason` (mention, assigned, watched, dateAlert, reminder) to focus on specific types
3. Filter by `project_id` to scope to a specific project's notifications

### Mark Notifications as Read
1. Use `list_notifications` to identify unread notification IDs
2. Use `mark_notification_read` with a list of `notification_ids` to mark them as read
3. The badge counter decreases by the number of marked notifications

### Get Notification Details
1. Use `get_notification` with `notification_id` to retrieve the notification's reason, work package ID, and actor
2. Use the `work_package_id` to fetch the associated work package with `get_work_package` for context

### Filter Notifications by Project
1. Use `list_notifications` with a `project_id` filter to see only notifications from a specific project
2. Useful for triage when working across multiple projects

## Configuration
- Notification preferences are configured per user in My Account > Notifications
- Users can enable/disable notifications for each reason type (mentions, assignments, watching, date alerts, reminders)
- Daily email digest is configured in My Account > Email Reminders
- Administrators cannot override individual user notification preferences
- In-app notifications are always enabled for @mentions regardless of user preference settings

## Related Modules
- **Work Packages** — most notifications are triggered by work package activity
- **Activity** — notifications link to specific activity entries (comments, status changes, etc.)
- **Meetings** — meeting invitations and updates generate notifications for attendees
- **News** — new news items can trigger notifications for project members
