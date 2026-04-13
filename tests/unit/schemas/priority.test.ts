import { describe, it, expect } from "vitest";
import { PrioritySchema } from "../../../src/schemas/index.js";

const minimalPriority = { id: 3, name: "High" };

const fullPriority = {
  _type: "Priority",
  _links: { self: { href: "/api/v3/priorities/3" } },
  id: 3,
  name: "High",
  position: 3,
  isDefault: false,
  isActive: true,
  color: "#ff6600",
};

describe("PrioritySchema", () => {
  it("parses a minimal valid priority", () => {
    const result = PrioritySchema.parse(minimalPriority);
    expect(result.id).toBe(3);
    expect(result.name).toBe("High");
  });

  it("parses a full priority with all fields", () => {
    const result = PrioritySchema.parse(fullPriority);
    expect(result.position).toBe(3);
    expect(result.isDefault).toBe(false);
    expect(result.isActive).toBe(true);
    expect(result.color).toBe("#ff6600");
  });

  it("throws when id is missing", () => {
    expect(() => PrioritySchema.parse({ name: "High" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => PrioritySchema.parse({ id: 3 })).toThrow();
  });

  it("throws when id is a string", () => {
    expect(() => PrioritySchema.parse({ id: "3", name: "High" })).toThrow();
  });

  it("position is optional", () => {
    const result = PrioritySchema.parse(minimalPriority);
    expect(result.position).toBeUndefined();
  });

  it("isDefault is optional", () => {
    const result = PrioritySchema.parse(minimalPriority);
    expect(result.isDefault).toBeUndefined();
  });

  it("isActive is optional", () => {
    const result = PrioritySchema.parse(minimalPriority);
    expect(result.isActive).toBeUndefined();
  });

  it("color is optional", () => {
    const result = PrioritySchema.parse(minimalPriority);
    expect(result.color).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = PrioritySchema.parse(fullPriority);
    expect(result._links?.self?.href).toBe("/api/v3/priorities/3");
  });
});
