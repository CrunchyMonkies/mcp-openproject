import type { OpenProjectClient } from "./client/index.js";
import { OpenProjectError } from "./errors.js";

/**
 * Maps OpenProject module names to their _links key on project HAL resources.
 * If a module is enabled for a project, its link key appears in project._links.
 */
export const MODULE_LINK_KEYS: Record<string, string> = {
  time_tracking: "timeEntries",
  news: "news",
  wiki: "wiki",
  forums: "forums",
  budgets: "budgets",
  documents: "documents",
  repository: "revisions",
  activity: "activities",
  members: "memberships",
  versions: "versions",
  backlogs: "backlogs",
  costs: "costsByType",
};

/**
 * Maps tool domain identifiers (used in register function naming) to
 * the OpenProject module they require. Domains not listed here are
 * considered core and always registered.
 */
export const DOMAIN_MODULE: Record<string, string> = {
  "time-entries": "time_tracking",
  "news": "news",
  "documents": "documents",
  "budgets": "budgets",
  "revisions": "repository",
  "activities": "activity",
  "versions": "versions",
  "memberships": "members",
};

/** Additional write tools beyond the create_/update_/delete_ prefix convention. */
const EXTRA_WRITE_TOOLS = new Set([
  "add_comment",
  "execute_custom_action",
  "mark_notification_read",
]);

/** Returns true if the tool name represents a write (mutating) operation. */
export function isWriteTool(name: string): boolean {
  return (
    name.startsWith("create_") ||
    name.startsWith("update_") ||
    name.startsWith("delete_") ||
    EXTRA_WRITE_TOOLS.has(name)
  );
}

/**
 * Detect available modules by inspecting the API root's _links.
 * Returns the set of module names whose link keys are present.
 */
export function detectModulesFromLinks(links: Record<string, unknown>): Set<string> {
  const available = new Set<string>();
  const linkKeys = new Set(Object.keys(links));
  for (const [module, key] of Object.entries(MODULE_LINK_KEYS)) {
    if (linkKeys.has(key)) {
      available.add(module);
    }
  }
  return available;
}

/**
 * Assert that a module is enabled for a project by checking project _links.
 * Throws OpenProjectError if the module is not enabled.
 * Use for tools that already have a resolved project object with _links.
 */
export function assertProjectModule(
  projectName: string,
  projectLinks: Record<string, unknown> | undefined,
  module: string,
  toolName: string,
): void {
  const linkKey = MODULE_LINK_KEYS[module];
  if (!linkKey) return;
  if (!projectLinks) return;
  if (linkKey in projectLinks) return;

  throw new OpenProjectError(
    `Module "${module}" is not enabled for project "${projectName}". ` +
    `Tool "${toolName}" requires this module. Enable it in OpenProject project settings.`,
  );
}

// Cache for project module checks (keyed by project ID)
const projectModuleCache = new Map<number, {
  name: string;
  links: Record<string, unknown>;
  expires: number;
}>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check that a module is enabled for a project identified by numeric ID.
 * Fetches and caches the project data. Use for tools that take a numeric projectId.
 */
export async function checkProjectModule(
  client: OpenProjectClient,
  projectId: number,
  module: string,
  toolName: string,
): Promise<void> {
  const linkKey = MODULE_LINK_KEYS[module];
  if (!linkKey) return;

  let cached = projectModuleCache.get(projectId);
  if (!cached || cached.expires < Date.now()) {
    const project = await client.getProject(projectId);
    const raw = project as Record<string, unknown>;
    const links = (raw._links as Record<string, unknown>) || {};
    const name = (raw.name as string) || `#${projectId}`;
    cached = { name, links, expires: Date.now() + CACHE_TTL_MS };
    projectModuleCache.set(projectId, cached);
  }

  if (!(linkKey in cached.links)) {
    throw new OpenProjectError(
      `Module "${module}" is not enabled for project "${cached.name}". ` +
      `Tool "${toolName}" requires this module. Enable it in OpenProject project settings.`,
    );
  }
}
