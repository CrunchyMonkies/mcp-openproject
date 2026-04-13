# Meetings

## Overview
The Meetings module supports planning and documenting project meetings within OpenProject. It handles both one-time meetings and recurring meeting series, with collaborative agenda editing, attendee tracking, and integration with work packages as action items. Meeting events can be subscribed to via calendar (iCal) for sync with external calendar applications.

## Key Concepts
- **One-Time Meeting**: A standalone scheduled meeting with a specific date, time, and duration
- **Recurring Meeting**: A series of meetings sharing a consistent agenda structure, created on a repeating schedule (daily, weekly, monthly, etc.)
- **Agenda**: Collaboratively edited meeting content created before the meeting using the WYSIWYG editor
- **Minutes**: The finalized record of decisions, outcomes, and action items documented during or after the meeting
- **Attendees**: Project members invited to the meeting; attendance status (invited, accepted, declined, attended) is tracked
- **Action Items**: Work packages linked within meeting minutes to track follow-up tasks
- **Calendar Subscription**: iCal URL for syncing meeting events with Outlook, Apple Calendar, or Google Calendar

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
Meetings are not directly exposed via MCP API tools — meetings, agendas, and minutes are created and managed through the OpenProject web UI.

## Common Operations

### Create a One-Time Meeting (UI)
1. Navigate to the project's Meetings section in the sidebar
2. Click "New meeting" and select "One-time meeting"
3. Enter title, date, start time, duration, and location
4. Add attendees from project members list
5. Click "Create" to schedule the meeting

### Create a Recurring Meeting (UI)
1. Click "New meeting" and select "Recurring meeting"
2. Set the recurrence pattern (daily, weekly, bi-weekly, monthly)
3. Define start date and optionally an end date or occurrence count
4. Add the shared agenda structure that will apply to each occurrence
5. Click "Create" to generate the recurring series

### Add Agenda Items (UI)
1. Open the meeting and navigate to the Agenda tab
2. Click "Add agenda item" and enter the item title and duration
3. Optionally assign the item to a responsible person
4. Collaborators can edit the agenda simultaneously before the meeting

### Record Minutes (UI)
1. During or after the meeting, open the Minutes tab
2. Document decisions, outcomes, and action items in the WYSIWYG editor
3. Link work packages as action items using the `#WP_ID` syntax
4. Click "Close meeting" to finalize minutes and notify attendees

### Subscribe to Meeting Calendar (UI)
1. Navigate to the Meetings module
2. Copy the iCal subscription URL from the Calendar subscription section
3. Add the URL as a calendar subscription in Outlook, Apple Calendar, or Google Calendar

## Configuration
- Meetings module must be enabled per project in Project Settings > Modules
- Only project members can be added as attendees
- Role permissions control who can create, edit, and close meetings
- The iCal calendar feed includes all meetings the user is invited to across all projects

## Related Modules
- **Work Packages** — action items in meeting minutes link directly to work packages
- **Members** — attendees are drawn from the project member list
- **Notifications** — meeting invitations and updates trigger notifications to attendees
- **Calendar** — meeting dates can be viewed alongside work package dates in the calendar module
