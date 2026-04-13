# Documents

## Overview
The Documents module provides a simple document management system within projects, allowing teams to upload, organize, and categorize project-related files. Documents are stored directly in OpenProject and can be grouped by category for easier retrieval.

## Key Concepts
- **Document**: A file uploaded to a project with a title, optional description, and category
- **Category**: Organizational grouping for documents (e.g., Specifications, Contracts, Reports) — configurable per project
- **Versioning**: Multiple files can be attached to a single document record to maintain version history
- **Attachments**: Each document can have one or more file attachments

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_documents` — retrieve all documents in a project, optionally filtered by category
- `get_document` — fetch details of a single document including its attachments
- `update_document` — modify document metadata such as title, description, or category

## Common Operations

### List All Documents in a Project
1. Use `list_documents` with `project_id` to retrieve all documents for the project
2. The response includes document titles, categories, descriptions, and attachment metadata
3. Filter by category if the project has multiple document categories configured

### Retrieve a Specific Document
1. Use `get_document` with `document_id` to fetch full document details
2. The response includes all attached files with their download URLs
3. Use the download URL to access or present the file content

### Update Document Metadata
1. Use `update_document` with `document_id` and fields to change (`title`, `description`, `category_id`)
2. File attachments cannot be changed via the MCP tools — use the OpenProject UI to add or remove files

## Configuration
- Documents module must be enabled per project in Project Settings > Modules
- Document categories are configured via Administration > Document Categories
- Upload file size limits are set via Administration > Attachments
- Role permissions control who can view, create, edit, and delete documents

## Related Modules
- **Work Packages** — individual files can also be attached directly to work packages
- **File Storage** — for Nextcloud/OneDrive/SharePoint integration; Documents handles direct uploads
- **Wiki** — for structured textual documentation; Documents handles binary file storage
- **Activity** — document uploads and updates appear in the project activity feed
