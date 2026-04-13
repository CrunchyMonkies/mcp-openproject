import { describe, it, expect } from "vitest";
import {
  WorkPackageSchema,
  CreateWorkPackageInputSchema,
  UpdateWorkPackageInputSchema,
} from "../../../src/schemas/index.js";

const minimalWP = {
  id: 10,
  subject: "Fix the bug",
  lockVersion: 3,
};

const fullWP = {
  _type: "WorkPackage",
  _links: {
    self: { href: "/api/v3/work_packages/10" },
    assignee: { href: "/api/v3/users/5", title: "Alice" },
    status: { href: "/api/v3/statuses/1", title: "New" },
  },
  _embedded: {
    status: { id: 1, name: "New" },
  },
  id: 10,
  subject: "Fix the bug",
  lockVersion: 3,
  description: { format: "markdown", raw: "Details here", html: "<p>Details here</p>" },
  startDate: "2024-01-01",
  dueDate: "2024-01-31",
  derivedStartDate: null,
  derivedDueDate: null,
  estimatedTime: "PT8H",
  spentTime: "PT2H",
  percentageDone: 50,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
};

describe("WorkPackageSchema", () => {
  it("parses a minimal valid work package", () => {
    const result = WorkPackageSchema.parse(minimalWP);
    expect(result.id).toBe(10);
    expect(result.subject).toBe("Fix the bug");
    expect(result.lockVersion).toBe(3);
  });

  it("parses a full work package with all fields", () => {
    const result = WorkPackageSchema.parse(fullWP);
    expect(result.percentageDone).toBe(50);
    expect(result.estimatedTime).toBe("PT8H");
    expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
  });

  it("throws when id is missing", () => {
    const { id: _id, ...withoutId } = minimalWP;
    expect(() => WorkPackageSchema.parse(withoutId)).toThrow();
  });

  it("throws when subject is missing", () => {
    const { subject: _subject, ...withoutSubject } = minimalWP;
    expect(() => WorkPackageSchema.parse(withoutSubject)).toThrow();
  });

  it("throws when lockVersion is missing", () => {
    const { lockVersion: _lv, ...withoutLV } = minimalWP;
    expect(() => WorkPackageSchema.parse(withoutLV)).toThrow();
  });

  it("throws when id is a string instead of number", () => {
    expect(() => WorkPackageSchema.parse({ ...minimalWP, id: "10" })).toThrow();
  });

  it("parses description as an object with format/raw/html", () => {
    const result = WorkPackageSchema.parse({
      ...minimalWP,
      description: { format: "markdown", raw: "# Hello", html: "<h1>Hello</h1>" },
    });
    expect(typeof result.description).toBe("object");
    expect((result.description as { raw: string }).raw).toBe("# Hello");
  });

  it("parses description as a plain string", () => {
    const result = WorkPackageSchema.parse({ ...minimalWP, description: "plain text" });
    expect(result.description).toBe("plain text");
  });

  it("startDate accepts null", () => {
    const result = WorkPackageSchema.parse({ ...minimalWP, startDate: null });
    expect(result.startDate).toBeNull();
  });

  it("dueDate accepts null", () => {
    const result = WorkPackageSchema.parse({ ...minimalWP, dueDate: null });
    expect(result.dueDate).toBeNull();
  });

  it("startDate is optional", () => {
    const result = WorkPackageSchema.parse(minimalWP);
    expect(result.startDate).toBeUndefined();
  });

  it("dueDate is optional", () => {
    const result = WorkPackageSchema.parse(minimalWP);
    expect(result.dueDate).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = WorkPackageSchema.parse(fullWP);
    expect(result._links?.self?.href).toBe("/api/v3/work_packages/10");
    expect(result._links?.assignee?.title).toBe("Alice");
  });

  it("preserves HAL _embedded passthrough", () => {
    const result = WorkPackageSchema.parse(fullWP);
    expect(result._embedded).toBeDefined();
  });
});

describe("CreateWorkPackageInputSchema", () => {
  it("parses with only required subject", () => {
    const result = CreateWorkPackageInputSchema.parse({ subject: "New task" });
    expect(result.subject).toBe("New task");
  });

  it("throws when subject is missing", () => {
    expect(() => CreateWorkPackageInputSchema.parse({})).toThrow();
  });

  it("parses with all optional fields", () => {
    const result = CreateWorkPackageInputSchema.parse({
      subject: "New task",
      type: "/api/v3/types/1",
      description: "Details",
      startDate: "2024-01-01",
      dueDate: "2024-01-31",
      estimatedTime: "PT8H",
      percentageDone: 0,
    });
    expect(result.type).toBe("/api/v3/types/1");
    expect(result.estimatedTime).toBe("PT8H");
  });
});

describe("UpdateWorkPackageInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateWorkPackageInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with selected fields", () => {
    const result = UpdateWorkPackageInputSchema.parse({
      subject: "Updated subject",
      percentageDone: 75,
    });
    expect(result.subject).toBe("Updated subject");
    expect(result.percentageDone).toBe(75);
  });
});
