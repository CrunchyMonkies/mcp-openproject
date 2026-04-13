# File Storage

## Overview
The File Storage module handles file attachments and cloud storage integrations for work packages. Files can be attached directly to work packages, or linked from Nextcloud, OneDrive (Enterprise), or SharePoint (Enterprise). Cloud integrations support automatic project folder management to keep files organized.

## Key Concepts
- **Direct Attachments**: Files uploaded and stored directly in OpenProject, attached to a work package
- **Nextcloud Integration**: Link files and folders from a connected Nextcloud instance to work packages; files remain in Nextcloud
- **OneDrive Integration** (Enterprise): Link files from Microsoft OneDrive to work packages
- **SharePoint Integration** (Enterprise): Link files from SharePoint document libraries to work packages
- **File Links**: References from a work package to a file in an external cloud storage provider
- **Automatic Project Folders**: OpenProject can automatically create and manage project/work package folders in connected cloud storage
- **Attachment**: A file uploaded directly to OpenProject and stored on the server

## MCP Tools
These tools from the `@crunchymonkies/mcp-openproject` server interact with this module:
- `list_file_links` — retrieve all cloud storage file links associated with a work package
- `get_file_link` — fetch details of a single file link including the file name, URL, and storage provider
- `delete_file_link` — remove a file link from a work package (does not delete the file from cloud storage)
- `get_attachment` — retrieve metadata and download URL for a directly attached file
- `delete_attachment` — permanently delete a directly attached file from OpenProject

## Common Operations

### List Files Linked to a Work Package
1. Use `list_file_links` with `work_package_id` to retrieve all cloud storage links for that work package
2. The response includes file name, storage type (Nextcloud, OneDrive, SharePoint), and access URL
3. Use the URL to present direct links to the files in the originating storage system

### Get a Direct Attachment
1. Use `get_attachment` with `attachment_id` to retrieve the attachment metadata
2. The response includes file name, file size, content type, and a download URL
3. Use the download URL to access or display the file content

### Remove a Cloud File Link
1. Use `list_file_links` to identify the `file_link_id` for the link to remove
2. Use `delete_file_link` with the `file_link_id` to unlink the file from the work package
3. The file remains in the cloud storage provider; only the reference in OpenProject is removed

### Delete a Direct Attachment
1. Use `get_attachment` to confirm the attachment details before deletion
2. Use `delete_attachment` with `attachment_id` to permanently delete the file from OpenProject storage
3. Deletion is irreversible; the file is removed from the server

## Configuration
- Direct file attachments are available in all editions; no separate module activation required
- Nextcloud integration is configured via Administration > File Storages > Add Nextcloud storage
- OneDrive/SharePoint integration requires Enterprise edition; configured via Administration > File Storages
- File size upload limits are set via Administration > Attachments
- Automatic project folder management is configured per file storage connection

## Related Modules
- **Work Packages** — file links and attachments are always associated with specific work packages
- **Documents** — for project-level document management (direct uploads); File Storage handles WP-level attachments and cloud links
- **Activity** — file attachment and link events appear in the work package activity feed
