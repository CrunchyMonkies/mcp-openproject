import { describe, it, expect } from "vitest";
import { TypeSchema } from "../../../src/schemas/index.js";

const minimalType = { id: 2, name: "Bug" };

const fullType = {
  _type: "Type",
  _links: { self: { href: "/api/v3/types/2" } },
  id: 2,
  name: "Bug",
  color: "#ff0000",
  position: 2,
  isDefault: false,
  isMilestone: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
};

describe("TypeSchema", () => {
  it("parses a minimal valid type", () => {
    const result = TypeSchema.parse(minimalType);
    expect(result.id).toBe(2);
    expect(result.name).toBe("Bug");
  });

  it("parses a full type with all fields", () => {
    const result = TypeSchema.parse(fullType);
    expect(result.color).toBe("#ff0000");
    expect(result.position).toBe(2);
    expect(result.isDefault).toBe(false);
    expect(result.isMilestone).toBe(false);
  });

  it("throws when id is missing", () => {
    expect(() => TypeSchema.parse({ name: "Bug" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => TypeSchema.parse({ id: 2 })).toThrow();
  });

  it("throws when id is a string", () => {
    expect(() => TypeSchema.parse({ id: "2", name: "Bug" })).toThrow();
  });

  it("isMilestone is optional", () => {
    const result = TypeSchema.parse(minimalType);
    expect(result.isMilestone).toBeUndefined();
  });

  it("color is optional", () => {
    const result = TypeSchema.parse(minimalType);
    expect(result.color).toBeUndefined();
  });

  it("position is optional", () => {
    const result = TypeSchema.parse(minimalType);
    expect(result.position).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = TypeSchema.parse(fullType);
    expect(result._links?.self?.href).toBe("/api/v3/types/2");
  });
});
