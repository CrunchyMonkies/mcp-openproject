import { describe, it, expect } from "vitest";
import {
  UserSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
} from "../../../src/schemas/index.js";

const minimalUser = { id: 5 };

const fullUser = {
  _type: "User",
  _links: {
    self: { href: "/api/v3/users/5" },
    avatar: { href: "https://example.com/avatar.png" },
  },
  _embedded: {},
  id: 5,
  name: "Alice Smith",
  login: "alice",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  admin: false,
  status: "active",
  language: "en",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
};

describe("UserSchema", () => {
  it("parses a minimal valid user with only id", () => {
    const result = UserSchema.parse(minimalUser);
    expect(result.id).toBe(5);
  });

  it("parses a full user with all fields", () => {
    const result = UserSchema.parse(fullUser);
    expect(result.name).toBe("Alice Smith");
    expect(result.login).toBe("alice");
    expect(result.firstName).toBe("Alice");
    expect(result.lastName).toBe("Smith");
    expect(result.email).toBe("alice@example.com");
    expect(result.admin).toBe(false);
    expect(result.status).toBe("active");
    expect(result.language).toBe("en");
  });

  it("throws when id is missing", () => {
    expect(() => UserSchema.parse({ name: "Alice" })).toThrow();
  });

  it("throws when id is a string", () => {
    expect(() => UserSchema.parse({ id: "5" })).toThrow();
  });

  it("name is optional", () => {
    const result = UserSchema.parse(minimalUser);
    expect(result.name).toBeUndefined();
  });

  it("login is optional", () => {
    const result = UserSchema.parse(minimalUser);
    expect(result.login).toBeUndefined();
  });

  it("firstName is optional", () => {
    const result = UserSchema.parse(minimalUser);
    expect(result.firstName).toBeUndefined();
  });

  it("lastName is optional", () => {
    const result = UserSchema.parse(minimalUser);
    expect(result.lastName).toBeUndefined();
  });

  it("email is optional", () => {
    const result = UserSchema.parse(minimalUser);
    expect(result.email).toBeUndefined();
  });

  it("preserves HAL _links passthrough", () => {
    const result = UserSchema.parse(fullUser);
    expect(result._links?.self?.href).toBe("/api/v3/users/5");
  });
});

describe("CreateUserInputSchema", () => {
  const validCreate = {
    login: "alice",
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Smith",
  };

  it("parses with all required fields", () => {
    const result = CreateUserInputSchema.parse(validCreate);
    expect(result.login).toBe("alice");
    expect(result.email).toBe("alice@example.com");
    expect(result.firstName).toBe("Alice");
    expect(result.lastName).toBe("Smith");
  });

  it("throws when login is missing", () => {
    const { login: _l, ...rest } = validCreate;
    expect(() => CreateUserInputSchema.parse(rest)).toThrow();
  });

  it("throws when email is missing", () => {
    const { email: _e, ...rest } = validCreate;
    expect(() => CreateUserInputSchema.parse(rest)).toThrow();
  });

  it("throws when firstName is missing", () => {
    const { firstName: _f, ...rest } = validCreate;
    expect(() => CreateUserInputSchema.parse(rest)).toThrow();
  });

  it("throws when lastName is missing", () => {
    const { lastName: _l, ...rest } = validCreate;
    expect(() => CreateUserInputSchema.parse(rest)).toThrow();
  });

  it("password is optional", () => {
    const result = CreateUserInputSchema.parse(validCreate);
    expect(result.password).toBeUndefined();
  });

  it("admin is optional", () => {
    const result = CreateUserInputSchema.parse(validCreate);
    expect(result.admin).toBeUndefined();
  });

  it("parses with optional fields included", () => {
    const result = CreateUserInputSchema.parse({
      ...validCreate,
      password: "secret123",
      admin: true,
      language: "de",
    });
    expect(result.password).toBe("secret123");
    expect(result.admin).toBe(true);
    expect(result.language).toBe("de");
  });
});

describe("UpdateUserInputSchema", () => {
  it("parses empty object — all fields optional", () => {
    const result = UpdateUserInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("parses with selected fields", () => {
    const result = UpdateUserInputSchema.parse({ login: "new-alice", admin: true });
    expect(result.login).toBe("new-alice");
    expect(result.admin).toBe(true);
  });
});
