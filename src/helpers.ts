import type { HalResource, User, WorkPackage } from "./types.js";

export function nestedGet(data: unknown, keys: string[], defaultValue: unknown = ""): unknown {
  let current: unknown = data;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return defaultValue;
    }
    const obj = current as Record<string, unknown>;
    if (!(key in obj)) {
      return defaultValue;
    }
    current = obj[key];
  }
  return current;
}

export function linkTitle(item: HalResource, relation: string, defaultValue = "-"): string {
  const linkObj = nestedGet(item, ["_links", relation], null);
  if (linkObj && typeof linkObj === "object") {
    const link = linkObj as Record<string, unknown>;
    const title = link.title;
    if (typeof title === "string" && title.trim()) {
      return title.trim();
    }
    const href = link.href;
    if (typeof href === "string" && href.trim()) {
      return href.trim().replace(/\/$/, "").split("/").pop() || defaultValue;
    }
  }
  return defaultValue;
}

export function formatDate(isoTimestamp: string): string {
  if (!isoTimestamp) return "-";
  if (isoTimestamp.length >= 10) return isoTimestamp.slice(0, 10);
  return isoTimestamp;
}

export function truncate(value: string, maxLength = 70): string {
  const text = value.trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function extractFormattableText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const raw = (value as Record<string, unknown>).raw;
    if (typeof raw === "string") return raw;
  }
  return "";
}

export function ensureIsoDate(value: string, argName: string): string {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`${argName} must be in YYYY-MM-DD format.`);
  }
  const parsed = new Date(normalized);
  if (isNaN(parsed.getTime())) {
    throw new Error(`${argName} must be a valid date in YYYY-MM-DD format.`);
  }
  return normalized;
}

export function extractNumericIdFromHref(href: string, resource: string): number | null {
  if (!href) return null;
  const pattern = new RegExp(`/${resource.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(\\d+)$`);
  const match = href.trim().match(pattern);
  if (!match) return null;
  return parseInt(match[1], 10);
}

export function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "decision";
}

export function userDisplayName(user: User): string {
  if (user.name?.trim()) return user.name.trim();
  const first = user.firstName?.trim() || "";
  const last = user.lastName?.trim() || "";
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;
  if (user.login?.trim()) return user.login.trim();
  if (user.id !== undefined) return String(user.id);
  return "-";
}

export function userIdentityKeys(user: User): string[] {
  const keys: string[] = [];
  const name = user.name?.trim() || "";
  const login = user.login?.trim() || "";
  const first = user.firstName?.trim() || "";
  const last = user.lastName?.trim() || "";
  const full = [first, last].filter(Boolean).join(" ");

  for (const value of [name, login, first, last, full]) {
    if (value) keys.push(value);
  }
  if (user.id !== undefined) keys.push(String(user.id));
  return keys;
}

export function statusBucket(statusName: string): "completed" | "blockers" | "in_progress" {
  const label = normalize(statusName);
  if (["done", "closed", "resolved", "complete", "completed"].some((t) => label.includes(t))) {
    return "completed";
  }
  if (["block", "risk", "hold", "stuck"].some((t) => label.includes(t))) {
    return "blockers";
  }
  return "in_progress";
}

export function filterWorkPackages(
  workPackages: WorkPackage[],
  statusFilter?: string,
  assigneeFilter?: string,
): WorkPackage[] {
  const statusQuery = normalize(statusFilter || "");
  const assigneeQuery = normalize(assigneeFilter || "");

  return workPackages.filter((wp) => {
    if (statusQuery) {
      const status = normalize(linkTitle(wp, "status", ""));
      if (!status.includes(statusQuery)) return false;
    }
    if (assigneeQuery) {
      const assignee = normalize(linkTitle(wp, "assignee", "unassigned"));
      if (!assignee.includes(assigneeQuery)) return false;
    }
    return true;
  });
}

export function filterUsers(users: User[], query?: string): User[] {
  const needle = normalize(query || "");
  if (!needle) return users;

  return users.filter((user) => {
    const keys = userIdentityKeys(user);
    return keys.some((key) => key.toLowerCase().includes(needle));
  });
}

export function extractEmbeddedElements(payload: unknown): HalResource[] {
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  const embedded = obj._embedded;
  if (!embedded || typeof embedded !== "object") return [];
  const emb = embedded as Record<string, unknown>;
  const elements = emb.elements;
  if (!Array.isArray(elements)) return [];
  return elements.filter((item): item is HalResource => item !== null && typeof item === "object");
}
