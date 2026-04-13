import { describe, test, expect, beforeAll } from "vitest";
import { getTestClient, getTestProject } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";
import type { Project } from "../../src/schemas/index.js";
import {
  detectModulesFromLinks,
  assertProjectModule,
  checkProjectModule,
  MODULE_LINK_KEYS,
} from "../../src/modules.js";

let client: OpenProjectClient;
let project: Project;

beforeAll(async () => {
  client = getTestClient();
  project = await getTestProject();
});

describe("Module detection from API root", () => {
  test("getServerInfo returns _links for module detection", async () => {
    const root = await client.getServerInfo();
    expect(root).toBeDefined();
    expect(typeof root).toBe("object");

    const links = (root as Record<string, unknown>)?._links;
    expect(links).toBeDefined();
    expect(typeof links).toBe("object");
  });

  test("detectModulesFromLinks returns a set from root _links", async () => {
    const root = await client.getServerInfo();
    const links = (root as Record<string, unknown>)?._links as Record<string, unknown>;
    const modules = detectModulesFromLinks(links || {});

    expect(modules).toBeInstanceOf(Set);
    // The exact modules depend on the server config, so just verify the return type
    for (const m of modules) {
      expect(typeof m).toBe("string");
      expect(MODULE_LINK_KEYS).toHaveProperty(m);
    }
  });
});

describe("Per-project module checking", () => {
  test("project response includes _links for module detection", async () => {
    const fetched = await client.getProject(project.id);
    const links = (fetched as Record<string, unknown>)._links;
    expect(links).toBeDefined();
    expect(typeof links).toBe("object");
  });

  test("assertProjectModule does not throw for available modules", async () => {
    const fetched = await client.getProject(project.id);
    const links = (fetched as Record<string, unknown>)._links as Record<string, unknown>;

    // workPackages link should always be present
    if (links && "workPackages" in links) {
      expect(() =>
        assertProjectModule(project.name, links, "work_package_tracking", "list_work_packages"),
      ).not.toThrow();
    }
  });

  test("assertProjectModule throws for a missing module link", async () => {
    // Use an empty links object to simulate a project with no modules
    expect(() =>
      assertProjectModule(project.name, {}, "news", "list_news"),
    ).toThrow(/not enabled/);
  });

  test("checkProjectModule caches and validates", async () => {
    // This test verifies checkProjectModule works with a real project.
    // Since we don't know which modules are enabled, test with a module
    // that the project definitely supports or doesn't.
    const fetched = await client.getProject(project.id);
    const links = (fetched as Record<string, unknown>)._links as Record<string, unknown>;

    // Find a module that IS enabled on this project
    let enabledModule: string | undefined;
    for (const [module, linkKey] of Object.entries(MODULE_LINK_KEYS)) {
      if (links && linkKey in links) {
        enabledModule = module;
        break;
      }
    }

    if (enabledModule) {
      // Should not throw for an enabled module
      await expect(
        checkProjectModule(client, project.id, enabledModule, "test_tool"),
      ).resolves.not.toThrow();
    }

    // Find a module that is NOT enabled on this project
    let disabledModule: string | undefined;
    for (const [module, linkKey] of Object.entries(MODULE_LINK_KEYS)) {
      if (links && !(linkKey in links)) {
        disabledModule = module;
        break;
      }
    }

    if (disabledModule) {
      // Should throw for a disabled module
      await expect(
        checkProjectModule(client, project.id, disabledModule, "test_tool"),
      ).rejects.toThrow(/not enabled/);
    }
  });
});

describe("Read-only mode detection", () => {
  test("isWriteTool correctly classifies common tools", async () => {
    const { isWriteTool } = await import("../../src/modules.js");

    // Read tools
    expect(isWriteTool("list_projects")).toBe(false);
    expect(isWriteTool("get_work_package")).toBe(false);
    expect(isWriteTool("list_statuses")).toBe(false);
    expect(isWriteTool("weekly_summary")).toBe(false);

    // Write tools
    expect(isWriteTool("create_project")).toBe(true);
    expect(isWriteTool("update_work_package")).toBe(true);
    expect(isWriteTool("delete_time_entry")).toBe(true);
    expect(isWriteTool("add_comment")).toBe(true);
  });
});
