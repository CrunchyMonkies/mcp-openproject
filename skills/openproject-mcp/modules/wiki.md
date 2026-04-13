# Wiki

## Overview
The Wiki module provides collaborative documentation within projects, offering a WYSIWYG editor (CKEditor5) supporting CommonMark and GitHub Flavored Markdown. Pages can be organized hierarchically with parent/child relationships, and a configurable sidebar menu provides navigation through the wiki structure.

## Key Concepts
- **Pages**: Individual documentation units with title, content, and optional parent page for hierarchy
- **WYSIWYG Editor**: CKEditor5 with toolbar for bold, italic, headings, lists, tables, code blocks, and image insertion
- **Page Hierarchy**: Parent/child page relationships create a structured documentation tree
- **Macros**: Embedded dynamic content including table of contents, work package tables, Gantt charts, and child page links
- **Cross-Linking**: Link to other wiki pages with `[[Page name]]`, work packages with `#WP_ID`, projects, users, meetings, and versions
- **Wiki Menu**: Configurable sidebar navigation allowing custom ordering and grouping of wiki pages
- **Auto-Formatting**: Markdown shortcuts (e.g., `**text**` for bold, `# Heading`) trigger WYSIWYG formatting automatically
- **Versioning**: Wiki pages maintain edit history; previous versions can be viewed and restored

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
Wiki content is not directly exposed via MCP API tools — wiki pages are created and managed through the OpenProject web UI.

## Common Operations

### Create a Wiki Page (UI)
1. Navigate to the project's Wiki section in the sidebar
2. Click "New wiki page" and enter a title
3. Write content using the WYSIWYG editor or paste Markdown
4. Set a parent page if building a hierarchy
5. Click "Save" to publish

### Embed a Work Package Table in a Wiki Page (UI)
1. In the wiki editor, use the macro toolbar to insert a "Work packages" macro
2. Configure filters to define which work packages appear
3. The macro renders a live work package table when the page is viewed

### Add a Table of Contents Macro (UI)
1. In the wiki editor, use the macro toolbar to insert a "Table of contents" macro
2. The macro automatically generates anchor links to all headings on the page

### Cross-Link to a Work Package (UI)
1. In the wiki editor, type `#` followed by the work package ID (e.g., `#42`)
2. OpenProject auto-completes and renders a clickable link to the work package

## Configuration
- Wiki module must be enabled per project in Project Settings > Modules
- Wiki menu items can be configured in the Wiki sidebar settings within the project
- Page editing permissions are role-based: users need "Edit wiki pages" permission
- Wiki page deletion requires the "Delete wiki pages" permission

## Related Modules
- **Work Packages** — wiki pages can embed live work package tables and link to individual WPs
- **Meetings** — meeting minutes and agendas can reference wiki pages
- **Documents** — for binary file storage; wiki handles structured textual documentation
- **Activity** — wiki page edits appear in the project activity feed
