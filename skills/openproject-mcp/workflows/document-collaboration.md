# Document Collaboration

## Goal
Create and manage project documentation, link files to work packages, and coordinate document review tasks. Use this workflow when a project requires formal documentation such as specifications, design documents, or deliverable reports.

## Prerequisites
- Documents module enabled (for document management)
- File Storage module enabled (for file link management; requires Nextcloud or similar integration)
- Work Packages module enabled
- Role with permissions to create/edit documents and work packages

## Modules Involved
- **Documents** — stores and organizes project documents with metadata
- **File Storage** — manages file links between external storage and work packages
- **Work Packages** — tracks document-related tasks (review, approval, update)
- **Activity** — records changes to documents and linked work packages

## Process

### Step 1: List Existing Documents
Check what documentation already exists in the project before creating duplicates.

```
tool_call: list_documents(project_id: "my-project")
```

Review titles, categories, and descriptions to understand the current documentation landscape.

### Step 2: Upload or Link Files to Work Packages
Associate external files (stored in Nextcloud or another configured file storage) with relevant work packages.

```
tool_call: list_file_links(work_package_id: 101)
```

Review existing file links. Use the file storage integration UI to upload new files and link them — direct file upload via API requires the file storage addon to be configured.

### Step 3: Track Document-Related Tasks
Create work packages to represent document review, approval, or update tasks.

```
tool_call: create_work_package(project_id: "my-project", subject: "Review Technical Architecture Document v1.2", type: "Task", assignee: {id: 7}, dueDate: "2026-04-21", description: "Review the architecture doc linked below and provide sign-off or revision comments by due date. Document: [Architecture v1.2](https://nextcloud.example.com/docs/arch-v1.2.pdf)")
```

### Step 4: Review Document Status
Retrieve the document record to check its current metadata and category.

```
tool_call: get_document(id: 55)
```

### Step 5: Update Document Metadata
Update the document title, description, or category as it evolves.

```
tool_call: update_document(id: 55, title: "Technical Architecture Document v1.3", description: "Updated to reflect microservices decomposition decision from 2026-04-10 steering committee.")
```

### Step 6: Discuss in Work Package Comments
Use work package comments as the threaded discussion space for document review feedback.

```
tool_call: add_comment(work_package_id: 301, comment: "Section 3.2 needs updating — the database schema shown does not reflect the migration we ran in Sprint 10. See attached screenshot for the current state.")
```

### Step 7: Track Changes
Review the activity stream to see what changed on the document or its related work packages.

```
tool_call: list_activities(project_id: "my-project")
```

## Data Flow
Documents (metadata and category) -> linked to Work Packages via File Links -> review Tasks (work packages) -> Comments (review discussion) -> Activity (change history). The document record in OpenProject holds metadata; the actual file bytes live in the configured file storage (Nextcloud, etc.).

## Tips & Pitfalls
- Do not store sensitive documents without confirming the project visibility setting — a public project exposes all its documents to anyone with the instance URL.
- Use the document `description` field to record the document's purpose and revision history summary; this makes `list_documents` output useful without opening each document.
- Create a work package for every formal document review cycle — ad-hoc verbal reviews leave no traceable record of who approved what and when.
- When a document is superseded, update the description to note the superseding document rather than deleting the old one — deletion removes the audit trail.
- File links depend on the file storage module being configured; if `list_file_links` returns empty unexpectedly, verify the file storage integration is active in the project settings.
