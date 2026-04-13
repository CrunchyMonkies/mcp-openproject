import { describe, it, expect } from "vitest";
import {
  ProjectSchema,
  CreateProjectInputSchema,
  UpdateProjectInputSchema,
} from "../../../src/schemas/index.js";

const minimalProject = {
  id: 1,
  identifier: "my-project",
  name: "My Project",
};

const fullProject = {
  _type: "Project",
  _links: {
    self: { href: "/api/v3/projects/1", title: "My Project" },
    parent: { href: "/api/v3/projects/0", title: "Root" },
  },
  _embedded: {
    status: { id: 1, name: "On track" },
  },
  id: 1,
  identifier: "my-project",
  name: "My Project",
  description: { format: "markdown", raw: "# Hello", html: "<h1>Hello</h1>" },
  public: true,
  active: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
};

describe("ProjectSchema", () => {
  it("parses a minimal valid project", () => {
    const result = ProjectSchema.parse(minimalProject);
    expect(result.id).toBe(1);
    expect(result.identifier).toBe("my-project");
    expect(result.name).toBe("My Project");
  });

  it("parses a full project with all fields", () => {
    const result = ProjectSchema.parse(fullProject);
    expect(result.id).toBe(1);
    expect(result.public).toBe(true);
    expect(result.active).toBe(true);
    expect(result.description?.format).toBe("markdown");
    expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
  });

  it("throws when id is missing", () => {
    const { id: _id, ...withoutId } = minimalProject;
    expect(() => ProjectSchema.parse(withoutId)).toThrow();
  });

  it("throws when identifier is missing", () => {
    const { identifier: _identifier, ...withoutIdentifier } = minimalProject;
    expect(() => ProjectSchema.parse(withoutIdentifier)).toThrow();
  });

  it("throws when name is missing", () => {
    const { name: _name, ...withoutName } = minimalProject;
    expect(() => ProjectSchema.parse(withoutName)).toThrow();
  });

  it("throws when id is a string instead of number", () => {
    expect(() => ProjectSchema.parse({ ...minimalProject, id: "1" })).toThrow();
  });

  it("description is optional", () => {
    const result = ProjectSchema.parse(minimalProject);
    expect(result.description).toBeUndefined();
  });

  it("public is optional", () => {
    const result = ProjectSchema.parse(minimalProject);
    expect(result.public).toBeUndefined();
  });

  it("active is optional", () => {
    const result = ProjectSchema.parse(minimalProject);
    expect(result.active).toBeUndefined();
  });

  it("createdAt is optional", () => {
    const result = ProjectSchema.parse(minimalProject);
    expect(result.createdAt).toBeUndefined();
  });

  it("updatedAt is optional", () => {
    const result = ProjectSchema.parse(minimalProject);
    expect(result.updatedAt).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = ProjectSchema.parse(fullProject);
    expect(result._links?.self?.href).toBe("/api/v3/projects/1");
    expect(result._links?.parent?.title).toBe("Root");
  });

  it("preserves HAL _embedded passthrough", () => {
    const result = ProjectSchema.parse(fullProject);
    expect(result._embedded).toBeDefined();
  });

  it("preserves unknown extra fields via catchall", () => {
    const result = ProjectSchema.parse({ ...minimalProject, customField42: "extra" });
    expect((result as Record<string, unknown>).customField42).toBe("extra");
  });
});

describe("CreateProjectInputSchema", () => {
  it("parses with only required name", () => {
    const result = CreateProjectInputSchema.parse({ name: "New Project" });
    expect(result.name).toBe("New Project");
  });

  it("parses with all optional fields", () => {
    const result = CreateProjectInputSchema.parse({
      name: "New Project",
      identifier: "new-project",
      description: { raw: "Some description" },
      public: false,
      parent: "/api/v3/projects/5",
    });
    expect(result.identifier).toBe("new-project");
    expect(result.description?.raw).toBe("Some description");
    expect(result.parent).toBe("/api/v3/projects/5");
  });

  it("throws when name is missing", () => {
    expect(() => CreateProjectInputSchema.parse({ identifier: "x" })).toThrow();
  });

  it("identifier is optional", () => {
    const result = CreateProjectInputSchema.parse({ name: "New Project" });
    expect(result.identifier).toBeUndefined();
  });
});

describe("UpdateProjectInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateProjectInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with all optional fields set", () => {
    const result = UpdateProjectInputSchema.parse({
      name: "Renamed",
      description: { raw: "Updated desc" },
      public: true,
      active: false,
    });
    expect(result.name).toBe("Renamed");
    expect(result.active).toBe(false);
  });
});
