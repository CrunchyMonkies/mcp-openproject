import { describe, test, expect } from "vitest";
import {
  isWriteTool,
  detectModulesFromLinks,
  assertProjectModule,
  MODULE_LINK_KEYS,
  DOMAIN_MODULE,
} from "../../src/modules.js";
import { OpenProjectError } from "../../src/errors.js";

describe("isWriteTool", () => {
  test("detects create_ prefix as write", () => {
    expect(isWriteTool("create_project")).toBe(true);
    expect(isWriteTool("create_work_package")).toBe(true);
    expect(isWriteTool("create_time_entry")).toBe(true);
  });

  test("detects update_ prefix as write", () => {
    expect(isWriteTool("update_project")).toBe(true);
    expect(isWriteTool("update_work_package")).toBe(true);
    expect(isWriteTool("update_work_package_status")).toBe(true);
  });

  test("detects delete_ prefix as write", () => {
    expect(isWriteTool("delete_project")).toBe(true);
    expect(isWriteTool("delete_work_package")).toBe(true);
  });

  test("detects extra write tools", () => {
    expect(isWriteTool("add_comment")).toBe(true);
    expect(isWriteTool("execute_custom_action")).toBe(true);
    expect(isWriteTool("mark_notification_read")).toBe(true);
  });

  test("identifies read tools as non-write", () => {
    expect(isWriteTool("list_projects")).toBe(false);
    expect(isWriteTool("get_project")).toBe(false);
    expect(isWriteTool("list_work_packages")).toBe(false);
    expect(isWriteTool("get_work_package")).toBe(false);
    expect(isWriteTool("list_statuses")).toBe(false);
    expect(isWriteTool("weekly_summary")).toBe(false);
    expect(isWriteTool("log_decision")).toBe(false);
    expect(isWriteTool("get_server_info")).toBe(false);
  });
});

describe("detectModulesFromLinks", () => {
  test("detects modules from matching link keys", () => {
    const links = {
      self: { href: "/" },
      timeEntries: { href: "/api/v3/time_entries" },
      news: { href: "/api/v3/news" },
      memberships: { href: "/api/v3/memberships" },
    };
    const modules = detectModulesFromLinks(links);
    expect(modules.has("time_tracking")).toBe(true);
    expect(modules.has("news")).toBe(true);
    expect(modules.has("members")).toBe(true);
  });

  test("returns empty set when no module links are present", () => {
    const links = {
      self: { href: "/" },
      projects: { href: "/api/v3/projects" },
    };
    const modules = detectModulesFromLinks(links);
    expect(modules.size).toBe(0);
  });

  test("handles empty links object", () => {
    const modules = detectModulesFromLinks({});
    expect(modules.size).toBe(0);
  });

  test("detects all known module link keys", () => {
    // Build links object with all known keys
    const links: Record<string, unknown> = {};
    for (const key of Object.values(MODULE_LINK_KEYS)) {
      links[key] = { href: `/api/v3/${key}` };
    }
    const modules = detectModulesFromLinks(links);
    expect(modules.size).toBe(Object.keys(MODULE_LINK_KEYS).length);
  });
});

describe("assertProjectModule", () => {
  test("does not throw when module link is present", () => {
    const links = {
      news: { href: "/api/v3/projects/1/news" },
      timeEntries: { href: "/api/v3/projects/1/time_entries" },
    };
    expect(() =>
      assertProjectModule("TestProject", links, "news", "list_news"),
    ).not.toThrow();
  });

  test("throws OpenProjectError when module link is missing", () => {
    const links = {
      self: { href: "/api/v3/projects/1" },
    };
    expect(() =>
      assertProjectModule("TestProject", links, "news", "list_news"),
    ).toThrow(OpenProjectError);
  });

  test("error message includes project name, module, and tool", () => {
    const links = {};
    try {
      assertProjectModule("MyProject", links, "time_tracking", "list_time_entries");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(OpenProjectError);
      const message = (err as OpenProjectError).message;
      expect(message).toContain("MyProject");
      expect(message).toContain("time_tracking");
      expect(message).toContain("list_time_entries");
    }
  });

  test("does not throw when projectLinks is undefined (defensive)", () => {
    expect(() =>
      assertProjectModule("TestProject", undefined, "news", "list_news"),
    ).not.toThrow();
  });

  test("does not throw for unknown module names (defensive)", () => {
    expect(() =>
      assertProjectModule("TestProject", {}, "unknown_module", "some_tool"),
    ).not.toThrow();
  });
});

describe("DOMAIN_MODULE mapping", () => {
  test("all domain modules reference valid MODULE_LINK_KEYS entries", () => {
    for (const [domain, module] of Object.entries(DOMAIN_MODULE)) {
      expect(MODULE_LINK_KEYS).toHaveProperty(
        module,
        expect.any(String),
      );
    }
  });

  test("covers expected module-dependent domains", () => {
    expect(DOMAIN_MODULE).toHaveProperty("time-entries");
    expect(DOMAIN_MODULE).toHaveProperty("news");
    expect(DOMAIN_MODULE).toHaveProperty("documents");
    expect(DOMAIN_MODULE).toHaveProperty("budgets");
    expect(DOMAIN_MODULE).toHaveProperty("revisions");
    expect(DOMAIN_MODULE).toHaveProperty("activities");
    expect(DOMAIN_MODULE).toHaveProperty("versions");
    expect(DOMAIN_MODULE).toHaveProperty("memberships");
  });
});
