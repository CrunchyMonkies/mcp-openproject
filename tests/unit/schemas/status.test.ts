import { describe, it, expect } from "vitest";
import { StatusSchema } from "../../../src/schemas/index.js";

const minimalStatus = { id: 1, name: "New" };

const fullStatus = {
  _type: "Status",
  _links: { self: { href: "/api/v3/statuses/1" } },
  id: 1,
  name: "New",
  isClosed: false,
  position: 1,
  isDefault: true,
  isReadonly: false,
  color: "#1234ab",
};

describe("StatusSchema", () => {
  it("parses a minimal valid status", () => {
    const result = StatusSchema.parse(minimalStatus);
    expect(result.id).toBe(1);
    expect(result.name).toBe("New");
  });

  it("parses a full status with all fields", () => {
    const result = StatusSchema.parse(fullStatus);
    expect(result.isClosed).toBe(false);
    expect(result.position).toBe(1);
    expect(result.isDefault).toBe(true);
    expect(result.isReadonly).toBe(false);
    expect(result.color).toBe("#1234ab");
  });

  it("throws when id is missing", () => {
    expect(() => StatusSchema.parse({ name: "New" })).toThrow();
  });

  it("throws when name is missing", () => {
    expect(() => StatusSchema.parse({ id: 1 })).toThrow();
  });

  it("throws when id is not a number", () => {
    expect(() => StatusSchema.parse({ id: "1", name: "New" })).toThrow();
  });

  it("isClosed is optional", () => {
    const result = StatusSchema.parse(minimalStatus);
    expect(result.isClosed).toBeUndefined();
  });

  it("position is optional", () => {
    const result = StatusSchema.parse(minimalStatus);
    expect(result.position).toBeUndefined();
  });

  it("isDefault is optional", () => {
    const result = StatusSchema.parse(minimalStatus);
    expect(result.isDefault).toBeUndefined();
  });

  it("isReadonly is optional", () => {
    const result = StatusSchema.parse(minimalStatus);
    expect(result.isReadonly).toBeUndefined();
  });

  it("color is optional", () => {
    const result = StatusSchema.parse(minimalStatus);
    expect(result.color).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = StatusSchema.parse(fullStatus);
    expect(result._links?.self?.href).toBe("/api/v3/statuses/1");
  });
});
