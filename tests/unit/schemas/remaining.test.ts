import { describe, it, expect } from "vitest";
import {
  ActivitySchema,
  NotificationSchema,
  AttachmentSchema,
  MembershipSchema,
  CreateMembershipInputSchema,
  UpdateMembershipInputSchema,
  GroupSchema,
  CreateGroupInputSchema,
  UpdateGroupInputSchema,
  RoleSchema,
  NewsSchema,
  CreateNewsInputSchema,
  UpdateNewsInputSchema,
  QuerySchema,
  CreateQueryInputSchema,
  DocumentSchema,
  UpdateDocumentInputSchema,
  CustomActionSchema,
  DaySchema,
  WeekDaySchema,
  NonWorkingDaySchema,
  FileLinkSchema,
  CreateFileLinkInputSchema,
  ViewSchema,
  CreateViewInputSchema,
  BudgetSchema,
  CategorySchema,
  RevisionSchema,
  PrincipalSchema,
  ConfigurationSchema,
  RootSchema,
  CollectionSchema,
} from "../../../src/schemas/index.js";

// ---------------------------------------------------------------------------
// ActivitySchema
// ---------------------------------------------------------------------------
describe("ActivitySchema", () => {
  it("parses with only id", () => {
    const result = ActivitySchema.parse({ id: 1 });
    expect(result.id).toBe(1);
  });

  it("throws when id is missing", () => {
    expect(() => ActivitySchema.parse({})).toThrow();
  });

  it("parses comment as object", () => {
    const result = ActivitySchema.parse({ id: 1, comment: { raw: "hello", html: "<p>hello</p>" } });
    expect((result.comment as { raw: string }).raw).toBe("hello");
  });

  it("parses comment as string", () => {
    const result = ActivitySchema.parse({ id: 1, comment: "plain" });
    expect(result.comment).toBe("plain");
  });

  it("details is optional", () => {
    const result = ActivitySchema.parse({ id: 1 });
    expect(result.details).toBeUndefined();
  });

  it("parses details array", () => {
    const result = ActivitySchema.parse({
      id: 1,
      details: [{ raw: "Changed status", html: "<p>Changed status</p>" }],
    });
    expect(result.details).toHaveLength(1);
    expect(result.details![0].raw).toBe("Changed status");
  });

  it("preserves HAL _links passthrough", () => {
    const result = ActivitySchema.parse({
      id: 1,
      _links: { self: { href: "/api/v3/activities/1" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/activities/1");
  });
});

// ---------------------------------------------------------------------------
// NotificationSchema
// ---------------------------------------------------------------------------
describe("NotificationSchema", () => {
  it("parses with only id", () => {
    const result = NotificationSchema.parse({ id: 2 });
    expect(result.id).toBe(2);
  });

  it("throws when id is missing", () => {
    expect(() => NotificationSchema.parse({})).toThrow();
  });

  it("subject is optional", () => {
    const result = NotificationSchema.parse({ id: 2 });
    expect(result.subject).toBeUndefined();
  });

  it("reason is optional", () => {
    const result = NotificationSchema.parse({ id: 2 });
    expect(result.reason).toBeUndefined();
  });

  it("readIAN is optional", () => {
    const result = NotificationSchema.parse({ id: 2 });
    expect(result.readIAN).toBeUndefined();
  });

  it("parses full notification", () => {
    const result = NotificationSchema.parse({
      id: 2,
      subject: "WP updated",
      reason: "mentioned",
      readIAN: false,
    });
    expect(result.subject).toBe("WP updated");
    expect(result.readIAN).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AttachmentSchema
// ---------------------------------------------------------------------------
describe("AttachmentSchema", () => {
  it("parses with only id", () => {
    const result = AttachmentSchema.parse({ id: 3 });
    expect(result.id).toBe(3);
  });

  it("throws when id is missing", () => {
    expect(() => AttachmentSchema.parse({})).toThrow();
  });

  it("fileName is optional", () => {
    const result = AttachmentSchema.parse({ id: 3 });
    expect(result.fileName).toBeUndefined();
  });

  it("fileSize is optional", () => {
    const result = AttachmentSchema.parse({ id: 3 });
    expect(result.fileSize).toBeUndefined();
  });

  it("contentType is optional", () => {
    const result = AttachmentSchema.parse({ id: 3 });
    expect(result.contentType).toBeUndefined();
  });

  it("parses full attachment", () => {
    const result = AttachmentSchema.parse({
      id: 3,
      fileName: "report.pdf",
      fileSize: 204800,
      contentType: "application/pdf",
      digest: { algorithm: "md5", hash: "abc123" },
    });
    expect(result.fileName).toBe("report.pdf");
    expect(result.fileSize).toBe(204800);
    expect(result.digest?.algorithm).toBe("md5");
  });

  it("preserves HAL _links passthrough", () => {
    const result = AttachmentSchema.parse({
      id: 3,
      _links: { self: { href: "/api/v3/attachments/3" }, downloadLocation: { href: "https://cdn.example.com/file.pdf" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/attachments/3");
  });
});

// ---------------------------------------------------------------------------
// MembershipSchema
// ---------------------------------------------------------------------------
describe("MembershipSchema", () => {
  it("parses with only id", () => {
    const result = MembershipSchema.parse({ id: 8 });
    expect(result.id).toBe(8);
  });

  it("throws when id is missing", () => {
    expect(() => MembershipSchema.parse({})).toThrow();
  });

  it("parses with timestamps", () => {
    const result = MembershipSchema.parse({ id: 8, createdAt: "2024-01-01T00:00:00Z" });
    expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
  });

  it("preserves HAL _links passthrough", () => {
    const result = MembershipSchema.parse({
      id: 8,
      _links: { self: { href: "/api/v3/memberships/8" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/memberships/8");
  });
});

describe("CreateMembershipInputSchema", () => {
  it("parses with required fields", () => {
    const result = CreateMembershipInputSchema.parse({ projectId: 1, principalId: 5, roleIds: [2, 3] });
    expect(result.projectId).toBe(1);
    expect(result.principalId).toBe(5);
    expect(result.roleIds).toEqual([2, 3]);
  });

  it("throws when projectId is missing", () => {
    expect(() => CreateMembershipInputSchema.parse({ principalId: 5, roleIds: [2] })).toThrow();
  });

  it("throws when principalId is missing", () => {
    expect(() => CreateMembershipInputSchema.parse({ projectId: 1, roleIds: [2] })).toThrow();
  });

  it("throws when roleIds is missing", () => {
    expect(() => CreateMembershipInputSchema.parse({ projectId: 1, principalId: 5 })).toThrow();
  });
});

describe("UpdateMembershipInputSchema", () => {
  it("parses with roleIds", () => {
    const result = UpdateMembershipInputSchema.parse({ roleIds: [1] });
    expect(result.roleIds).toEqual([1]);
  });

  it("throws when roleIds is missing", () => {
    expect(() => UpdateMembershipInputSchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// GroupSchema
// ---------------------------------------------------------------------------
describe("GroupSchema", () => {
  it("parses with id and name", () => {
    const result = GroupSchema.parse({ id: 9, name: "Developers" });
    expect(result.id).toBe(9);
    expect(result.name).toBe("Developers");
  });

  it("throws when id is missing", () => {
    expect(() => GroupSchema.parse({ name: "Developers" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => GroupSchema.parse({ id: 9 })).toThrow();
  });

  it("preserves HAL _links passthrough", () => {
    const result = GroupSchema.parse({
      id: 9,
      name: "Developers",
      _links: { self: { href: "/api/v3/groups/9" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/groups/9");
  });
});

describe("CreateGroupInputSchema", () => {
  it("parses with required name", () => {
    const result = CreateGroupInputSchema.parse({ name: "Admins" });
    expect(result.name).toBe("Admins");
  });

  it("throws when name is missing", () => {
    expect(() => CreateGroupInputSchema.parse({})).toThrow();
  });

  it("memberIds is optional", () => {
    const result = CreateGroupInputSchema.parse({ name: "Admins" });
    expect(result.memberIds).toBeUndefined();
  });

  it("parses with memberIds", () => {
    const result = CreateGroupInputSchema.parse({ name: "Admins", memberIds: [1, 2, 3] });
    expect(result.memberIds).toEqual([1, 2, 3]);
  });
});

describe("UpdateGroupInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateGroupInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with name and memberIds", () => {
    const result = UpdateGroupInputSchema.parse({ name: "New Name", memberIds: [4, 5] });
    expect(result.name).toBe("New Name");
    expect(result.memberIds).toEqual([4, 5]);
  });
});

// ---------------------------------------------------------------------------
// RoleSchema
// ---------------------------------------------------------------------------
describe("RoleSchema", () => {
  it("parses with id and name", () => {
    const result = RoleSchema.parse({ id: 10, name: "Developer" });
    expect(result.id).toBe(10);
    expect(result.name).toBe("Developer");
  });

  it("throws when id is missing", () => {
    expect(() => RoleSchema.parse({ name: "Developer" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => RoleSchema.parse({ id: 10 })).toThrow();
  });

  it("position is optional", () => {
    const result = RoleSchema.parse({ id: 10, name: "Developer" });
    expect(result.position).toBeUndefined();
  });

  it("parses with position", () => {
    const result = RoleSchema.parse({ id: 10, name: "Developer", position: 2 });
    expect(result.position).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// NewsSchema
// ---------------------------------------------------------------------------
describe("NewsSchema", () => {
  it("parses with id and title", () => {
    const result = NewsSchema.parse({ id: 11, title: "New feature released" });
    expect(result.id).toBe(11);
    expect(result.title).toBe("New feature released");
  });

  it("throws when id is missing", () => {
    expect(() => NewsSchema.parse({ title: "Announcement" })).toThrow();
  });

  it("throws when title is missing", () => {
    expect(() => NewsSchema.parse({ id: 11 })).toThrow();
  });

  it("parses with all optional fields", () => {
    const result = NewsSchema.parse({
      id: 11,
      title: "News",
      summary: "A short summary",
      description: { raw: "Long description", html: "<p>Long description</p>" },
    });
    expect(result.summary).toBe("A short summary");
  });

  it("description as string", () => {
    const result = NewsSchema.parse({ id: 11, title: "News", description: "plain text" });
    expect(result.description).toBe("plain text");
  });

  it("preserves HAL _links passthrough", () => {
    const result = NewsSchema.parse({
      id: 11,
      title: "News",
      _links: { self: { href: "/api/v3/news/11" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/news/11");
  });
});

describe("CreateNewsInputSchema", () => {
  it("parses with required fields", () => {
    const result = CreateNewsInputSchema.parse({ title: "Announcement", projectId: 1 });
    expect(result.title).toBe("Announcement");
    expect(result.projectId).toBe(1);
  });

  it("throws when title is missing", () => {
    expect(() => CreateNewsInputSchema.parse({ projectId: 1 })).toThrow();
  });

  it("throws when projectId is missing", () => {
    expect(() => CreateNewsInputSchema.parse({ title: "X" })).toThrow();
  });
});

describe("UpdateNewsInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateNewsInputSchema.parse({});
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// QuerySchema
// ---------------------------------------------------------------------------
describe("QuerySchema", () => {
  it("parses with id and name", () => {
    const result = QuerySchema.parse({ id: 12, name: "My Query" });
    expect(result.id).toBe(12);
    expect(result.name).toBe("My Query");
  });

  it("throws when id is missing", () => {
    expect(() => QuerySchema.parse({ name: "My Query" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => QuerySchema.parse({ id: 12 })).toThrow();
  });

  it("starred is optional", () => {
    const result = QuerySchema.parse({ id: 12, name: "My Query" });
    expect(result.starred).toBeUndefined();
  });

  it("public is optional", () => {
    const result = QuerySchema.parse({ id: 12, name: "My Query" });
    expect(result.public).toBeUndefined();
  });
});

describe("CreateQueryInputSchema", () => {
  it("parses with required name", () => {
    const result = CreateQueryInputSchema.parse({ name: "New Query" });
    expect(result.name).toBe("New Query");
  });

  it("throws when name is missing", () => {
    expect(() => CreateQueryInputSchema.parse({})).toThrow();
  });

  it("parses with filters array", () => {
    const result = CreateQueryInputSchema.parse({
      name: "Filtered",
      filters: [{ status: { operator: "=", values: ["1"] } }],
    });
    expect(result.filters).toHaveLength(1);
  });

  it("parses with sortBy and columns", () => {
    const result = CreateQueryInputSchema.parse({
      name: "Sorted",
      sortBy: [["id", "asc"]],
      columns: ["id", "subject", "status"],
    });
    expect(result.sortBy).toEqual([["id", "asc"]]);
    expect(result.columns).toEqual(["id", "subject", "status"]);
  });
});

// ---------------------------------------------------------------------------
// DocumentSchema
// ---------------------------------------------------------------------------
describe("DocumentSchema", () => {
  it("parses with only id", () => {
    const result = DocumentSchema.parse({ id: 13 });
    expect(result.id).toBe(13);
  });

  it("throws when id is missing", () => {
    expect(() => DocumentSchema.parse({})).toThrow();
  });

  it("title is optional", () => {
    const result = DocumentSchema.parse({ id: 13 });
    expect(result.title).toBeUndefined();
  });

  it("parses description as object", () => {
    const result = DocumentSchema.parse({
      id: 13,
      description: { raw: "Content", html: "<p>Content</p>" },
    });
    expect((result.description as { raw: string }).raw).toBe("Content");
  });

  it("parses description as string", () => {
    const result = DocumentSchema.parse({ id: 13, description: "plain" });
    expect(result.description).toBe("plain");
  });
});

describe("UpdateDocumentInputSchema", () => {
  it("parses empty object", () => {
    const result = UpdateDocumentInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with title and description", () => {
    const result = UpdateDocumentInputSchema.parse({ title: "New Title", description: "New desc" });
    expect(result.title).toBe("New Title");
  });
});

// ---------------------------------------------------------------------------
// CustomActionSchema
// ---------------------------------------------------------------------------
describe("CustomActionSchema", () => {
  it("parses with only id", () => {
    const result = CustomActionSchema.parse({ id: 14 });
    expect(result.id).toBe(14);
  });

  it("throws when id is missing", () => {
    expect(() => CustomActionSchema.parse({})).toThrow();
  });

  it("name is optional", () => {
    const result = CustomActionSchema.parse({ id: 14 });
    expect(result.name).toBeUndefined();
  });

  it("description is optional", () => {
    const result = CustomActionSchema.parse({ id: 14 });
    expect(result.description).toBeUndefined();
  });

  it("parses with name and description", () => {
    const result = CustomActionSchema.parse({ id: 14, name: "Close WP", description: "Closes the work package" });
    expect(result.name).toBe("Close WP");
    expect(result.description).toBe("Closes the work package");
  });
});

// ---------------------------------------------------------------------------
// DaySchema
// ---------------------------------------------------------------------------
describe("DaySchema", () => {
  it("parses with required date", () => {
    const result = DaySchema.parse({ date: "2024-01-15" });
    expect(result.date).toBe("2024-01-15");
  });

  it("throws when date is missing", () => {
    expect(() => DaySchema.parse({})).toThrow();
  });

  it("name is optional", () => {
    const result = DaySchema.parse({ date: "2024-01-15" });
    expect(result.name).toBeUndefined();
  });

  it("working is optional", () => {
    const result = DaySchema.parse({ date: "2024-01-15" });
    expect(result.working).toBeUndefined();
  });

  it("parses with name and working", () => {
    const result = DaySchema.parse({ date: "2024-01-15", name: "Monday", working: true });
    expect(result.name).toBe("Monday");
    expect(result.working).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// WeekDaySchema
// ---------------------------------------------------------------------------
describe("WeekDaySchema", () => {
  it("parses with required day", () => {
    const result = WeekDaySchema.parse({ day: 1 });
    expect(result.day).toBe(1);
  });

  it("throws when day is missing", () => {
    expect(() => WeekDaySchema.parse({})).toThrow();
  });

  it("throws when day is a string", () => {
    expect(() => WeekDaySchema.parse({ day: "Monday" })).toThrow();
  });

  it("name is optional", () => {
    const result = WeekDaySchema.parse({ day: 1 });
    expect(result.name).toBeUndefined();
  });

  it("parses with name and working", () => {
    const result = WeekDaySchema.parse({ day: 1, name: "Monday", working: true });
    expect(result.name).toBe("Monday");
    expect(result.working).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NonWorkingDaySchema
// ---------------------------------------------------------------------------
describe("NonWorkingDaySchema", () => {
  it("parses with required date", () => {
    const result = NonWorkingDaySchema.parse({ date: "2024-12-25" });
    expect(result.date).toBe("2024-12-25");
  });

  it("throws when date is missing", () => {
    expect(() => NonWorkingDaySchema.parse({})).toThrow();
  });

  it("id is optional", () => {
    const result = NonWorkingDaySchema.parse({ date: "2024-12-25" });
    expect(result.id).toBeUndefined();
  });

  it("parses with id and name", () => {
    const result = NonWorkingDaySchema.parse({ date: "2024-12-25", id: 15, name: "Christmas" });
    expect(result.id).toBe(15);
    expect(result.name).toBe("Christmas");
  });
});

// ---------------------------------------------------------------------------
// FileLinkSchema
// ---------------------------------------------------------------------------
describe("FileLinkSchema", () => {
  it("parses with only id", () => {
    const result = FileLinkSchema.parse({ id: 16 });
    expect(result.id).toBe(16);
  });

  it("throws when id is missing", () => {
    expect(() => FileLinkSchema.parse({})).toThrow();
  });

  it("originData is optional", () => {
    const result = FileLinkSchema.parse({ id: 16 });
    expect(result.originData).toBeUndefined();
  });

  it("parses originData with numeric id", () => {
    const result = FileLinkSchema.parse({
      id: 16,
      originData: { id: 42, name: "document.pdf", mimeType: "application/pdf", size: 10240 },
    });
    expect(result.originData?.id).toBe(42);
    expect(result.originData?.name).toBe("document.pdf");
  });

  it("parses originData with string id", () => {
    const result = FileLinkSchema.parse({
      id: 16,
      originData: { id: "file-abc", name: "image.png" },
    });
    expect(result.originData?.id).toBe("file-abc");
  });

  it("preserves HAL _links passthrough", () => {
    const result = FileLinkSchema.parse({
      id: 16,
      _links: { self: { href: "/api/v3/file_links/16" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/file_links/16");
  });
});

describe("CreateFileLinkInputSchema", () => {
  const validCreate = { storageUrl: "https://storage.example.com", originId: "file-abc", originName: "doc.pdf" };

  it("parses with required fields", () => {
    const result = CreateFileLinkInputSchema.parse(validCreate);
    expect(result.storageUrl).toBe("https://storage.example.com");
    expect(result.originId).toBe("file-abc");
    expect(result.originName).toBe("doc.pdf");
  });

  it("throws when storageUrl is missing", () => {
    const { storageUrl: _s, ...rest } = validCreate;
    expect(() => CreateFileLinkInputSchema.parse(rest)).toThrow();
  });

  it("throws when originId is missing", () => {
    const { originId: _o, ...rest } = validCreate;
    expect(() => CreateFileLinkInputSchema.parse(rest)).toThrow();
  });

  it("throws when originName is missing", () => {
    const { originName: _o, ...rest } = validCreate;
    expect(() => CreateFileLinkInputSchema.parse(rest)).toThrow();
  });

  it("originMimeType is optional", () => {
    const result = CreateFileLinkInputSchema.parse(validCreate);
    expect(result.originMimeType).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ViewSchema
// ---------------------------------------------------------------------------
describe("ViewSchema", () => {
  it("parses with only id", () => {
    const result = ViewSchema.parse({ id: 17 });
    expect(result.id).toBe(17);
  });

  it("throws when id is missing", () => {
    expect(() => ViewSchema.parse({})).toThrow();
  });

  it("name is optional", () => {
    const result = ViewSchema.parse({ id: 17 });
    expect(result.name).toBeUndefined();
  });

  it("parses with name", () => {
    const result = ViewSchema.parse({ id: 17, name: "My View" });
    expect(result.name).toBe("My View");
  });
});

describe("CreateViewInputSchema", () => {
  it("parses with required queryId", () => {
    const result = CreateViewInputSchema.parse({ queryId: 12 });
    expect(result.queryId).toBe(12);
  });

  it("throws when queryId is missing", () => {
    expect(() => CreateViewInputSchema.parse({})).toThrow();
  });

  it("name is optional", () => {
    const result = CreateViewInputSchema.parse({ queryId: 12 });
    expect(result.name).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// BudgetSchema
// ---------------------------------------------------------------------------
describe("BudgetSchema", () => {
  it("parses with only id", () => {
    const result = BudgetSchema.parse({ id: 18 });
    expect(result.id).toBe(18);
  });

  it("throws when id is missing", () => {
    expect(() => BudgetSchema.parse({})).toThrow();
  });

  it("subject is optional", () => {
    const result = BudgetSchema.parse({ id: 18 });
    expect(result.subject).toBeUndefined();
  });

  it("parses with subject", () => {
    const result = BudgetSchema.parse({ id: 18, subject: "Q1 Budget" });
    expect(result.subject).toBe("Q1 Budget");
  });

  it("preserves HAL _links passthrough", () => {
    const result = BudgetSchema.parse({
      id: 18,
      _links: { self: { href: "/api/v3/budgets/18" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/budgets/18");
  });
});

// ---------------------------------------------------------------------------
// CategorySchema
// ---------------------------------------------------------------------------
describe("CategorySchema", () => {
  it("parses with id and name", () => {
    const result = CategorySchema.parse({ id: 19, name: "Backend" });
    expect(result.id).toBe(19);
    expect(result.name).toBe("Backend");
  });

  it("throws when id is missing", () => {
    expect(() => CategorySchema.parse({ name: "Backend" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => CategorySchema.parse({ id: 19 })).toThrow();
  });

  it("preserves HAL _links passthrough", () => {
    const result = CategorySchema.parse({
      id: 19,
      name: "Backend",
      _links: { self: { href: "/api/v3/categories/19" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/categories/19");
  });
});

// ---------------------------------------------------------------------------
// RevisionSchema
// ---------------------------------------------------------------------------
describe("RevisionSchema", () => {
  it("parses with only id", () => {
    const result = RevisionSchema.parse({ id: 21 });
    expect(result.id).toBe(21);
  });

  it("throws when id is missing", () => {
    expect(() => RevisionSchema.parse({})).toThrow();
  });

  it("identifier is optional", () => {
    const result = RevisionSchema.parse({ id: 21 });
    expect(result.identifier).toBeUndefined();
  });

  it("parses message as object", () => {
    const result = RevisionSchema.parse({ id: 21, message: { raw: "Initial commit", html: "<p>Initial commit</p>" } });
    expect((result.message as { raw: string }).raw).toBe("Initial commit");
  });

  it("parses message as string", () => {
    const result = RevisionSchema.parse({ id: 21, message: "plain commit message" });
    expect(result.message).toBe("plain commit message");
  });

  it("preserves HAL _links passthrough", () => {
    const result = RevisionSchema.parse({
      id: 21,
      _links: { self: { href: "/api/v3/revisions/21" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/revisions/21");
  });
});

// ---------------------------------------------------------------------------
// PrincipalSchema
// ---------------------------------------------------------------------------
describe("PrincipalSchema", () => {
  it("parses with id and name", () => {
    const result = PrincipalSchema.parse({ id: 22, name: "Bob" });
    expect(result.id).toBe(22);
    expect(result.name).toBe("Bob");
  });

  it("throws when id is missing", () => {
    expect(() => PrincipalSchema.parse({ name: "Bob" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => PrincipalSchema.parse({ id: 22 })).toThrow();
  });

  it("preserves HAL _links passthrough", () => {
    const result = PrincipalSchema.parse({
      id: 22,
      name: "Bob",
      _links: { self: { href: "/api/v3/principals/22" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/principals/22");
  });
});

// ---------------------------------------------------------------------------
// ConfigurationSchema
// ---------------------------------------------------------------------------
describe("ConfigurationSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = ConfigurationSchema.parse({});
    expect(result).toBeDefined();
  });

  it("parses with all configuration fields", () => {
    const result = ConfigurationSchema.parse({
      maximumAttachmentFileSize: 5242880,
      perPageOptions: [10, 25, 50, 100],
      dateFormat: "YYYY-MM-DD",
      timeFormat: "HH:mm",
      startOfWeek: 1,
      activeFeatureFlags: ["new_ui", "dark_mode"],
    });
    expect(result.maximumAttachmentFileSize).toBe(5242880);
    expect(result.perPageOptions).toEqual([10, 25, 50, 100]);
    expect(result.dateFormat).toBe("YYYY-MM-DD");
    expect(result.startOfWeek).toBe(1);
    expect(result.activeFeatureFlags).toContain("new_ui");
  });

  it("preserves HAL _links passthrough", () => {
    const result = ConfigurationSchema.parse({
      _links: { self: { href: "/api/v3/configuration" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3/configuration");
  });
});

// ---------------------------------------------------------------------------
// RootSchema
// ---------------------------------------------------------------------------
describe("RootSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = RootSchema.parse({});
    expect(result).toBeDefined();
  });

  it("parses with instanceName and coreVersion", () => {
    const result = RootSchema.parse({ instanceName: "My OP Instance", coreVersion: "13.0.0" });
    expect(result.instanceName).toBe("My OP Instance");
    expect(result.coreVersion).toBe("13.0.0");
  });

  it("preserves HAL _links passthrough", () => {
    const result = RootSchema.parse({
      _links: { self: { href: "/api/v3" } },
    });
    expect(result._links?.self?.href).toBe("/api/v3");
  });
});

// ---------------------------------------------------------------------------
// CollectionSchema
// ---------------------------------------------------------------------------
describe("CollectionSchema", () => {
  it("parses a valid collection with elements array", () => {
    const result = CollectionSchema.parse({
      _type: "Collection",
      total: 2,
      count: 2,
      pageSize: 25,
      offset: 1,
      _embedded: {
        elements: [
          { _type: "Project", id: 1, identifier: "proj-a", name: "Project A" },
          { _type: "Project", id: 2, identifier: "proj-b", name: "Project B" },
        ],
      },
    });
    expect(result._type).toBe("Collection");
    expect(result.total).toBe(2);
    expect(result._embedded?.elements).toHaveLength(2);
  });

  it("parses an empty elements array", () => {
    const result = CollectionSchema.parse({
      _type: "Collection",
      total: 0,
      count: 0,
      _embedded: { elements: [] },
    });
    expect(result._embedded?.elements).toHaveLength(0);
  });

  it("parses with no _embedded field", () => {
    const result = CollectionSchema.parse({ _type: "Collection", total: 0, count: 0 });
    expect(result._embedded).toBeUndefined();
  });

  it("_type is optional", () => {
    const result = CollectionSchema.parse({ total: 5, _embedded: { elements: [] } });
    expect(result._type).toBeUndefined();
  });

  it("preserves unknown extra fields via catchall", () => {
    const result = CollectionSchema.parse({
      _type: "Collection",
      total: 0,
      _embedded: { elements: [] },
      customMeta: { page: 1 },
    });
    expect((result as Record<string, unknown>).customMeta).toEqual({ page: 1 });
  });

  it("preserves HAL _links in collection", () => {
    const result = CollectionSchema.parse({
      _type: "Collection",
      total: 0,
      _links: {
        self: { href: "/api/v3/projects" },
        nextByOffset: { href: "/api/v3/projects?offset=2" },
      },
      _embedded: { elements: [] },
    });
    expect(result._links).toBeDefined();
  });
});
