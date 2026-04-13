import { describe, it, expect } from "vitest";
import { RelationSchema, CreateRelationInputSchema } from "../../../src/schemas/index.js";

const minimalRelation = { id: 7, type: "follows" };

const fullRelation = {
  _type: "Relation",
  _links: {
    self: { href: "/api/v3/relations/7" },
    from: { href: "/api/v3/work_packages/1" },
    to: { href: "/api/v3/work_packages/2" },
  },
  id: 7,
  type: "follows",
  name: "Follows",
  reverseType: "precedes",
  description: "WP 1 must follow WP 2",
  lag: 2,
};

describe("RelationSchema", () => {
  it("parses a minimal valid relation", () => {
    const result = RelationSchema.parse(minimalRelation);
    expect(result.id).toBe(7);
    expect(result.type).toBe("follows");
  });

  it("parses a full relation with all fields", () => {
    const result = RelationSchema.parse(fullRelation);
    expect(result.name).toBe("Follows");
    expect(result.reverseType).toBe("precedes");
    expect(result.description).toBe("WP 1 must follow WP 2");
    expect(result.lag).toBe(2);
  });

  it("throws when id is missing", () => {
    expect(() => RelationSchema.parse({ type: "follows" })).toThrow();
  });

  it("throws when type is missing", () => {
    expect(() => RelationSchema.parse({ id: 7 })).toThrow();
  });

  it("throws when id is a string", () => {
    expect(() => RelationSchema.parse({ id: "7", type: "follows" })).toThrow();
  });

  it("description is optional", () => {
    const result = RelationSchema.parse(minimalRelation);
    expect(result.description).toBeUndefined();
  });

  it("lag is optional", () => {
    const result = RelationSchema.parse(minimalRelation);
    expect(result.lag).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = RelationSchema.parse(fullRelation);
    expect(result._links?.self?.href).toBe("/api/v3/relations/7");
    expect(result._links?.from?.href).toBe("/api/v3/work_packages/1");
  });
});

describe("CreateRelationInputSchema", () => {
  const validCreate = { fromId: 1, toId: 2, type: "follows" };

  it("parses with required fields", () => {
    const result = CreateRelationInputSchema.parse(validCreate);
    expect(result.fromId).toBe(1);
    expect(result.toId).toBe(2);
    expect(result.type).toBe("follows");
  });

  it("throws when fromId is missing", () => {
    expect(() => CreateRelationInputSchema.parse({ toId: 2, type: "follows" })).toThrow();
  });

  it("throws when toId is missing", () => {
    expect(() => CreateRelationInputSchema.parse({ fromId: 1, type: "follows" })).toThrow();
  });

  it("throws when type is missing", () => {
    expect(() => CreateRelationInputSchema.parse({ fromId: 1, toId: 2 })).toThrow();
  });

  it("description is optional", () => {
    const result = CreateRelationInputSchema.parse(validCreate);
    expect(result.description).toBeUndefined();
  });

  it("lag is optional", () => {
    const result = CreateRelationInputSchema.parse(validCreate);
    expect(result.lag).toBeUndefined();
  });

  it("parses with optional fields included", () => {
    const result = CreateRelationInputSchema.parse({
      ...validCreate,
      description: "Some desc",
      lag: 5,
    });
    expect(result.description).toBe("Some desc");
    expect(result.lag).toBe(5);
  });
});
