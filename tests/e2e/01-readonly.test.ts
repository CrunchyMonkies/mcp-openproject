import { describe, test, expect, beforeAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project, Status, Priority, User, Type } from "../../src/types.js";

let client: OpenProjectClient;
let project: Project;
let knownStatus: Status;
let knownPriority: Priority;
let knownUser: User;
let knownType: Type;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

describe("Listing endpoints", () => {
  test("lists projects with valid structure and data", async () => {
    const projects = await client.getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(typeof p.id).toBe("number");
      expect(p.id).toBeGreaterThan(0);
      expect(typeof p.identifier).toBe("string");
      expect(p.identifier.length).toBeGreaterThan(0);
      expect(typeof p.name).toBe("string");
      expect(p.name.length).toBeGreaterThan(0);
      expect(p._links?.self?.href).toContain(`/projects/${p.id}`);
    }
  });

  test("lists statuses with valid IDs and names", async () => {
    const statuses = await client.getStatuses();
    expect(statuses.length).toBeGreaterThan(0);
    const names = statuses.map((s) => s.name);
    for (const s of statuses) {
      expect(typeof s.id).toBe("number");
      expect(s.id).toBeGreaterThan(0);
      expect(typeof s.name).toBe("string");
      expect(s.name.length).toBeGreaterThan(0);
    }
    // OpenProject always has "New" and "Closed" statuses
    expect(names).toContain("New");
    expect(names).toContain("Closed");
    knownStatus = statuses[0];
  });

  test("lists priorities with valid IDs and names", async () => {
    const priorities = await client.getPriorities();
    expect(priorities.length).toBeGreaterThan(0);
    const names = priorities.map((p) => p.name);
    for (const p of priorities) {
      expect(typeof p.id).toBe("number");
      expect(p.id).toBeGreaterThan(0);
      expect(typeof p.name).toBe("string");
      expect(p.name.length).toBeGreaterThan(0);
    }
    // OpenProject always has "Normal" priority
    expect(names).toContain("Normal");
    knownPriority = priorities[0];
  });

  test("lists users with valid IDs and HAL links", async () => {
    const users = await client.getUsers();
    expect(users.length).toBeGreaterThan(0);
    for (const u of users) {
      expect(typeof u.id).toBe("number");
      expect(u.id).toBeGreaterThan(0);
      expect(u._links?.self?.href).toContain(`/users/${u.id}`);
    }
    knownUser = users[0];
  });

  test("lists types (global) with valid structure", async () => {
    const types = await client.getTypes();
    expect(types.length).toBeGreaterThan(0);
    const names = types.map((t) => t.name);
    for (const t of types) {
      expect(typeof t.id).toBe("number");
      expect(t.id).toBeGreaterThan(0);
      expect(typeof t.name).toBe("string");
      expect(t.name.length).toBeGreaterThan(0);
    }
    // OpenProject always has "Task" type
    expect(names).toContain("Task");
    knownType = types[0];
  });

  test("lists types (project-scoped) as subset of global types", async () => {
    const globalTypes = await client.getTypes();
    const projectTypes = await client.getTypes(project.id);
    expect(projectTypes.length).toBeGreaterThan(0);
    // Project types should be a subset of global types
    const globalIds = new Set(globalTypes.map((t) => t.id));
    for (const t of projectTypes) {
      expect(globalIds.has(t.id)).toBe(true);
    }
  });
});

describe("Entity resolution", () => {
  test("resolves project by identifier and returns full project data", async () => {
    const resolved = await client.resolveProject(project.identifier);
    expect(resolved.id).toBe(project.id);
    expect(resolved.identifier).toBe(project.identifier);
    expect(resolved.name).toBe(project.name);
  });

  test("resolves project by name and returns matching project", async () => {
    const resolved = await client.resolveProject(project.name);
    expect(resolved.id).toBe(project.id);
    expect(resolved.identifier).toBe(project.identifier);
    expect(resolved.name).toBe(project.name);
  });

  test("resolves project by ID string and returns matching project", async () => {
    const resolved = await client.resolveProject(String(project.id));
    expect(resolved.id).toBe(project.id);
    expect(resolved.identifier).toBe(project.identifier);
    expect(resolved.name).toBe(project.name);
  });

  test("rejects unknown project with descriptive error", async () => {
    await expect(client.resolveProject("nonexistent-xyz-999")).rejects.toThrow(
      /could not resolve project/i,
    );
  });

  test("resolves status by name and returns valid href", async () => {
    const resolved = await client.resolveStatus(knownStatus.name);
    expect(resolved.name).toBe(knownStatus.name);
    expect(resolved.href).toMatch(/\/statuses\/\d+$/);
  });

  test("rejects unknown status with available statuses list", async () => {
    await expect(client.resolveStatus("FakeStatus999")).rejects.toThrow(
      /available statuses/i,
    );
  });

  test("resolves priority by name and returns valid href", async () => {
    const resolved = await client.resolvePriority(knownPriority.name);
    expect(resolved.name).toBe(knownPriority.name);
    expect(resolved.href).toMatch(/\/priorities\/\d+$/);
  });

  test("rejects unknown priority with available priorities list", async () => {
    await expect(client.resolvePriority("FakePriority999")).rejects.toThrow(
      /available priorities/i,
    );
  });

  test("resolves user by ID and returns valid name and href", async () => {
    const resolved = await client.resolveUser(String(knownUser.id));
    expect(resolved.name).toBeTruthy();
    expect(resolved.name).not.toBe("-");
    expect(resolved.href).toMatch(/\/users\/\d+$/);
    expect(resolved.href).toContain(String(knownUser.id));
  });

  test("rejects unknown user with helpful error", async () => {
    await expect(client.resolveUser("nobody_xyz_999")).rejects.toThrow(
      /unknown user/i,
    );
  });

  test("resolves type by name and returns valid href", async () => {
    const resolved = await client.resolveType(project.id, "Task");
    expect(resolved.name).toBe("Task");
    expect(resolved.href).toMatch(/\/types\/\d+$/);
  });

  test("rejects unknown type with available types list", async () => {
    await expect(client.resolveType(project.id, "FakeType999")).rejects.toThrow(
      /available types/i,
    );
  });
});
