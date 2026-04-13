import { describe, it, expect } from "vitest";
import {
  TimeEntrySchema,
  CreateTimeEntryInputSchema,
  UpdateTimeEntryInputSchema,
} from "../../../src/schemas/index.js";

const minimalTimeEntry = { id: 20 };

const fullTimeEntry = {
  _type: "TimeEntry",
  _links: {
    self: { href: "/api/v3/time_entries/20" },
    workPackage: { href: "/api/v3/work_packages/10", title: "Fix the bug" },
    project: { href: "/api/v3/projects/1", title: "My Project" },
    activity: { href: "/api/v3/time_entries/activities/1", title: "Development" },
  },
  _embedded: {
    workPackage: { id: 10, subject: "Fix the bug", lockVersion: 3 },
  },
  id: 20,
  hours: "PT4H",
  comment: { format: "markdown", raw: "Worked on auth", html: "<p>Worked on auth</p>" },
  spentOn: "2024-01-15",
  ongoing: false,
  createdAt: "2024-01-15T09:00:00Z",
  updatedAt: "2024-01-15T13:00:00Z",
};

describe("TimeEntrySchema", () => {
  it("parses a minimal valid time entry with only id", () => {
    const result = TimeEntrySchema.parse(minimalTimeEntry);
    expect(result.id).toBe(20);
  });

  it("parses a full time entry with all fields", () => {
    const result = TimeEntrySchema.parse(fullTimeEntry);
    expect(result.hours).toBe("PT4H");
    expect(result.spentOn).toBe("2024-01-15");
    expect(result.ongoing).toBe(false);
  });

  it("throws when id is missing", () => {
    expect(() => TimeEntrySchema.parse({ hours: "PT4H" })).toThrow();
  });

  it("throws when id is a string", () => {
    expect(() => TimeEntrySchema.parse({ id: "20" })).toThrow();
  });

  it("parses comment as an object", () => {
    const result = TimeEntrySchema.parse(fullTimeEntry);
    expect(typeof result.comment).toBe("object");
    expect((result.comment as { raw: string }).raw).toBe("Worked on auth");
  });

  it("parses comment as a plain string", () => {
    const result = TimeEntrySchema.parse({ ...minimalTimeEntry, comment: "plain comment" });
    expect(result.comment).toBe("plain comment");
  });

  it("hours is optional", () => {
    const result = TimeEntrySchema.parse(minimalTimeEntry);
    expect(result.hours).toBeUndefined();
  });

  it("comment is optional", () => {
    const result = TimeEntrySchema.parse(minimalTimeEntry);
    expect(result.comment).toBeUndefined();
  });

  it("spentOn is optional", () => {
    const result = TimeEntrySchema.parse(minimalTimeEntry);
    expect(result.spentOn).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = TimeEntrySchema.parse(fullTimeEntry);
    expect(result._links?.self?.href).toBe("/api/v3/time_entries/20");
    expect(result._links?.workPackage?.title).toBe("Fix the bug");
  });

  it("preserves HAL _embedded passthrough", () => {
    const result = TimeEntrySchema.parse(fullTimeEntry);
    expect(result._embedded).toBeDefined();
  });
});

describe("CreateTimeEntryInputSchema", () => {
  const validCreate = {
    hours: "PT4H",
    spentOn: "2024-01-15",
    workPackageId: 10,
  };

  it("parses with required fields", () => {
    const result = CreateTimeEntryInputSchema.parse(validCreate);
    expect(result.hours).toBe("PT4H");
    expect(result.spentOn).toBe("2024-01-15");
    expect(result.workPackageId).toBe(10);
  });

  it("throws when hours is missing", () => {
    const { hours: _h, ...rest } = validCreate;
    expect(() => CreateTimeEntryInputSchema.parse(rest)).toThrow();
  });

  it("throws when spentOn is missing", () => {
    const { spentOn: _s, ...rest } = validCreate;
    expect(() => CreateTimeEntryInputSchema.parse(rest)).toThrow();
  });

  it("throws when workPackageId is missing", () => {
    const { workPackageId: _w, ...rest } = validCreate;
    expect(() => CreateTimeEntryInputSchema.parse(rest)).toThrow();
  });

  it("activityId is optional", () => {
    const result = CreateTimeEntryInputSchema.parse(validCreate);
    expect(result.activityId).toBeUndefined();
  });

  it("projectId is optional", () => {
    const result = CreateTimeEntryInputSchema.parse(validCreate);
    expect(result.projectId).toBeUndefined();
  });

  it("comment is optional", () => {
    const result = CreateTimeEntryInputSchema.parse(validCreate);
    expect(result.comment).toBeUndefined();
  });
});

describe("UpdateTimeEntryInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateTimeEntryInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with selected fields", () => {
    const result = UpdateTimeEntryInputSchema.parse({ hours: "PT6H", spentOn: "2024-02-01" });
    expect(result.hours).toBe("PT6H");
    expect(result.spentOn).toBe("2024-02-01");
  });
});
