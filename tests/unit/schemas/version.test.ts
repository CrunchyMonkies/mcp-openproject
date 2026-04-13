import { describe, it, expect } from "vitest";
import {
  VersionSchema,
  CreateVersionInputSchema,
  UpdateVersionInputSchema,
} from "../../../src/schemas/index.js";

const minimalVersion = { id: 4, name: "v1.0.0" };

const fullVersion = {
  _type: "Version",
  _links: {
    self: { href: "/api/v3/versions/4" },
    project: { href: "/api/v3/projects/1", title: "My Project" },
  },
  _embedded: {},
  id: 4,
  name: "v1.0.0",
  description: { format: "markdown", raw: "First release", html: "<p>First release</p>" },
  startDate: "2024-01-01",
  endDate: "2024-03-31",
  status: "open",
  sharing: "none",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("VersionSchema", () => {
  it("parses a minimal valid version", () => {
    const result = VersionSchema.parse(minimalVersion);
    expect(result.id).toBe(4);
    expect(result.name).toBe("v1.0.0");
  });

  it("parses a full version with all fields", () => {
    const result = VersionSchema.parse(fullVersion);
    expect(result.status).toBe("open");
    expect(result.sharing).toBe("none");
    expect(result.startDate).toBe("2024-01-01");
    expect(result.endDate).toBe("2024-03-31");
  });

  it("throws when id is missing", () => {
    expect(() => VersionSchema.parse({ name: "v1.0.0" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => VersionSchema.parse({ id: 4 })).toThrow();
  });

  it("throws when id is a string", () => {
    expect(() => VersionSchema.parse({ id: "4", name: "v1.0.0" })).toThrow();
  });

  it("startDate accepts null", () => {
    const result = VersionSchema.parse({ ...minimalVersion, startDate: null });
    expect(result.startDate).toBeNull();
  });

  it("endDate accepts null", () => {
    const result = VersionSchema.parse({ ...minimalVersion, endDate: null });
    expect(result.endDate).toBeNull();
  });

  it("startDate is optional", () => {
    const result = VersionSchema.parse(minimalVersion);
    expect(result.startDate).toBeUndefined();
  });

  it("endDate is optional", () => {
    const result = VersionSchema.parse(minimalVersion);
    expect(result.endDate).toBeUndefined();
  });

  it("parses description as object", () => {
    const result = VersionSchema.parse(fullVersion);
    expect(typeof result.description).toBe("object");
  });

  it("parses description as plain string", () => {
    const result = VersionSchema.parse({ ...minimalVersion, description: "plain" });
    expect(result.description).toBe("plain");
  });

  it("description is optional", () => {
    const result = VersionSchema.parse(minimalVersion);
    expect(result.description).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = VersionSchema.parse(fullVersion);
    expect(result._links?.self?.href).toBe("/api/v3/versions/4");
    expect(result._links?.project?.title).toBe("My Project");
  });
});

describe("CreateVersionInputSchema", () => {
  const validCreate = { name: "v2.0.0", projectId: 1 };

  it("parses with required fields", () => {
    const result = CreateVersionInputSchema.parse(validCreate);
    expect(result.name).toBe("v2.0.0");
    expect(result.projectId).toBe(1);
  });

  it("throws when name is missing", () => {
    expect(() => CreateVersionInputSchema.parse({ projectId: 1 })).toThrow();
  });

  it("throws when projectId is missing", () => {
    expect(() => CreateVersionInputSchema.parse({ name: "v2.0.0" })).toThrow();
  });

  it("parses with all optional fields", () => {
    const result = CreateVersionInputSchema.parse({
      ...validCreate,
      description: "Major release",
      startDate: "2024-04-01",
      endDate: "2024-06-30",
      status: "open",
      sharing: "system",
    });
    expect(result.description).toBe("Major release");
    expect(result.sharing).toBe("system");
  });
});

describe("UpdateVersionInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateVersionInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with selected fields", () => {
    const result = UpdateVersionInputSchema.parse({ name: "v1.0.1", status: "closed" });
    expect(result.name).toBe("v1.0.1");
    expect(result.status).toBe("closed");
  });
});
