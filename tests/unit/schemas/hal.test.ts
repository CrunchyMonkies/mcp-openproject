import { describe, it, expect } from "vitest";
import {
  HalLinkSchema,
  HalLinksSchema,
  HalResourceSchema,
} from "../../../src/schemas/index.js";

describe("HalLinkSchema", () => {
  it("parses a link with only href", () => {
    const result = HalLinkSchema.parse({ href: "/api/v3/projects/1" });
    expect(result.href).toBe("/api/v3/projects/1");
  });

  it("parses a link with href, title, and method", () => {
    const result = HalLinkSchema.parse({
      href: "/api/v3/projects/1",
      title: "My Project",
      method: "GET",
    });
    expect(result.href).toBe("/api/v3/projects/1");
    expect(result.title).toBe("My Project");
    expect(result.method).toBe("GET");
  });

  it("preserves unknown fields via catchall", () => {
    const result = HalLinkSchema.parse({
      href: "/api/v3/projects/1",
      templated: true,
      payload: { foo: "bar" },
    });
    expect((result as Record<string, unknown>).templated).toBe(true);
    expect((result as Record<string, unknown>).payload).toEqual({ foo: "bar" });
  });

  it("throws when href is missing", () => {
    expect(() => HalLinkSchema.parse({ title: "No href" })).toThrow();
  });

  it("throws when href is not a string", () => {
    expect(() => HalLinkSchema.parse({ href: 42 })).toThrow();
  });

  it("title is optional", () => {
    const result = HalLinkSchema.parse({ href: "/api/v3/projects/1" });
    expect(result.title).toBeUndefined();
  });

  it("method is optional", () => {
    const result = HalLinkSchema.parse({ href: "/api/v3/projects/1" });
    expect(result.method).toBeUndefined();
  });
});

describe("HalLinksSchema", () => {
  it("parses a record of links", () => {
    const result = HalLinksSchema.parse({
      self: { href: "/api/v3/projects/1" },
      project: { href: "/api/v3/projects/1", title: "My Project" },
    });
    expect(result.self?.href).toBe("/api/v3/projects/1");
    expect(result.project?.title).toBe("My Project");
  });

  it("parses an empty record", () => {
    const result = HalLinksSchema.parse({});
    expect(result).toEqual({});
  });

  it("allows undefined values in record entries", () => {
    const result = HalLinksSchema.parse({ self: undefined });
    expect(result.self).toBeUndefined();
  });
});

describe("HalResourceSchema", () => {
  it("parses a minimal resource with no fields", () => {
    const result = HalResourceSchema.parse({});
    expect(result).toBeDefined();
  });

  it("parses a resource with _type", () => {
    const result = HalResourceSchema.parse({ _type: "Project" });
    expect(result._type).toBe("Project");
  });

  it("parses a resource with _links", () => {
    const result = HalResourceSchema.parse({
      _type: "Project",
      _links: {
        self: { href: "/api/v3/projects/1" },
      },
    });
    expect(result._links?.self?.href).toBe("/api/v3/projects/1");
  });

  it("parses a resource with _embedded", () => {
    const result = HalResourceSchema.parse({
      _type: "Project",
      _embedded: {
        assignee: { id: 5, name: "Alice" },
      },
    });
    expect((result._embedded as Record<string, unknown>).assignee).toEqual({ id: 5, name: "Alice" });
  });

  it("preserves unknown extra fields via catchall", () => {
    const result = HalResourceSchema.parse({
      _type: "Project",
      customField: "hello",
      nested: { a: 1 },
    });
    expect((result as Record<string, unknown>).customField).toBe("hello");
    expect((result as Record<string, unknown>).nested).toEqual({ a: 1 });
  });

  it("_type is optional", () => {
    const result = HalResourceSchema.parse({ _links: {} });
    expect(result._type).toBeUndefined();
  });

  it("_links is optional", () => {
    const result = HalResourceSchema.parse({ _type: "Project" });
    expect(result._links).toBeUndefined();
  });

  it("_embedded is optional", () => {
    const result = HalResourceSchema.parse({ _type: "Project" });
    expect(result._embedded).toBeUndefined();
  });
});
