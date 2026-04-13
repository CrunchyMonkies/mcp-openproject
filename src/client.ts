import { OpenProjectError, extractErrorMessage } from "./errors.js";
import {
  extractEmbeddedElements,
  extractNumericIdFromHref,
  linkTitle,
  nestedGet,
  userDisplayName,
  userIdentityKeys,
} from "./helpers.js";
import type {
  HalResource,
  OpenProjectConfig,
  Priority,
  Project,
  Relation,
  ResolvedEntity,
  Status,
  Type,
  User,
  WorkPackage,
} from "./types.js";

const API_PREFIX = "/api/v3";
const MAX_PAGE_SIZE = 200;
const REQUEST_TIMEOUT_MS = 30_000;

export const RELATION_TYPES = new Set([
  "relates", "duplicates", "duplicated", "blocks", "blocked",
  "precedes", "follows", "includes", "partof", "requires", "required",
]);

export class OpenProjectClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(config: OpenProjectConfig) {
    let base = config.baseUrl.trim().replace(/\/+$/, "");
    if (base.endsWith(API_PREFIX)) {
      base = base.slice(0, -API_PREFIX.length);
    }
    if (!base) {
      throw new OpenProjectError("OPENPROJECT_BASE_URL is required.");
    }
    this.baseUrl = base;

    if (!config.apiToken) {
      throw new OpenProjectError("OPENPROJECT_API_TOKEN is required.");
    }
    this.authHeader = "Basic " + Buffer.from(`apikey:${config.apiToken}`).toString("base64");
  }

  private async request(
    method: string,
    path: string,
    options: {
      params?: Record<string, string | number>;
      payload?: unknown;
      expectedStatuses?: number[];
    } = {},
  ): Promise<unknown> {
    const { params, payload, expectedStatuses = [200] } = options;

    let normalizedPath = path;
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = `/${normalizedPath}`;
    }

    const url = new URL(`${this.baseUrl}${API_PREFIX}${normalizedPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: this.authHeader,
          Accept: "application/hal+json",
          "Content-Type": "application/json",
        },
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });

      if (expectedStatuses.includes(response.status)) {
        if (response.status === 204 || response.headers.get("content-length") === "0") {
          return {};
        }
        try {
          return await response.json();
        } catch {
          return {};
        }
      }

      const detail = await extractErrorMessage(response);

      if (response.status === 401 || response.status === 403) {
        throw new OpenProjectError(
          "Authentication failed. Check OPENPROJECT_BASE_URL, OPENPROJECT_API_TOKEN, and token permissions.",
          response.status,
        );
      }

      throw new OpenProjectError(
        `OpenProject API error ${response.status} for ${method.toUpperCase()} ${normalizedPath}: ${detail}`,
        response.status,
      );
    } catch (err) {
      if (err instanceof OpenProjectError) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new OpenProjectError("Request timed out after 30 seconds.");
      }
      throw new OpenProjectError(`Network error: ${err}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async collectCollection(
    path: string,
    params?: Record<string, string | number>,
    limit = 50,
  ): Promise<HalResource[]> {
    if (limit <= 0) return [];

    const baseParams = { ...params };
    const pageSize = Math.max(1, Math.min(limit, MAX_PAGE_SIZE));
    delete baseParams.pageSize;

    const collected: HalResource[] = [];
    let offset = 1;

    while (collected.length < limit) {
      const remaining = limit - collected.length;
      const requestParams: Record<string, string | number> = {
        ...baseParams,
        offset,
        pageSize: Math.min(pageSize, remaining),
      };

      const data = await this.request("GET", path, {
        params: requestParams,
        expectedStatuses: [200],
      });

      const elements = extractEmbeddedElements(data);
      if (elements.length === 0) break;

      collected.push(...elements.slice(0, remaining));

      const count = ((data as Record<string, unknown>).count as number) || elements.length;
      if (count <= 0) break;

      const links = nestedGet(data, ["_links", "nextByOffset"], null);
      if (!links || typeof links !== "object") break;

      offset += count;
    }

    return collected.slice(0, limit);
  }

  // --- Entity listing ---

  async getProjects(limit = 500): Promise<Project[]> {
    return this.collectCollection("/projects", undefined, limit) as Promise<Project[]>;
  }

  async getStatuses(): Promise<Status[]> {
    const data = await this.request("GET", "/statuses");
    return extractEmbeddedElements(data) as Status[];
  }

  async getPriorities(): Promise<Priority[]> {
    const data = await this.request("GET", "/priorities");
    return extractEmbeddedElements(data) as Priority[];
  }

  async getUsers(limit = 200): Promise<User[]> {
    return this.collectCollection("/users", undefined, limit) as Promise<User[]>;
  }

  async getTypes(projectId?: number): Promise<Type[]> {
    const endpoints: string[] = [];
    if (projectId !== undefined) {
      endpoints.push(`/projects/${projectId}/types`);
    }
    endpoints.push("/types");

    for (const endpoint of endpoints) {
      try {
        const data = await this.request("GET", endpoint);
        const elements = extractEmbeddedElements(data) as Type[];
        if (elements.length > 0) return elements;
      } catch (err) {
        if (
          err instanceof OpenProjectError &&
          endpoint.startsWith("/projects/") &&
          (err.statusCode === 404 || err.statusCode === 405)
        ) {
          continue;
        }
        throw err;
      }
    }

    return [];
  }

  // --- Entity resolution ---

  async resolveProject(projectRef: string): Promise<Project> {
    const target = projectRef.trim();
    if (!target) throw new OpenProjectError("Project value is empty.");

    const projects = await this.getProjects();
    if (projects.length === 0) {
      throw new OpenProjectError("No projects were returned by OpenProject.");
    }

    const lowered = target.toLowerCase();
    for (const project of projects) {
      const id = String(project.id || "").trim();
      const identifier = String(project.identifier || "").trim();
      const name = String(project.name || "").trim();

      if (/^\d+$/.test(target) && id === target) return project;
      if (identifier && identifier.toLowerCase() === lowered) return project;
      if (name && name.toLowerCase() === lowered) return project;
    }

    throw new OpenProjectError(
      "Could not resolve project. Provide a valid project ID or identifier, or set OPENPROJECT_DEFAULT_PROJECT.",
    );
  }

  async resolveProjectIdentifier(projectRef: string): Promise<string> {
    const project = await this.resolveProject(projectRef);
    const identifier = String(project.identifier || "").trim();
    if (identifier) return identifier;
    if (project.id !== undefined) return String(project.id);
    throw new OpenProjectError("Resolved project does not include identifier or id.");
  }

  async resolveStatus(statusName: string): Promise<ResolvedEntity> {
    const lowered = statusName.trim().toLowerCase();
    const data = await this.request("GET", "/statuses");
    const statuses = extractEmbeddedElements(data) as Status[];

    const available: string[] = [];
    for (const status of statuses) {
      const name = String(status.name || "").trim();
      const href = (nestedGet(status, ["_links", "self", "href"], "") as string) || "";
      if (name) available.push(name);
      if (name && name.toLowerCase() === lowered) {
        return { name, href: href || `${API_PREFIX}/statuses/${status.id}` };
      }
    }

    if (available.length > 0) {
      throw new OpenProjectError(
        `Unknown status '${statusName}'. Available statuses: ${[...new Set(available)].sort().join(", ")}`,
      );
    }
    throw new OpenProjectError("No statuses were returned by OpenProject.");
  }

  async resolveAllowedTransitionStatus(
    workPackage: WorkPackage,
    statusName: string,
  ): Promise<ResolvedEntity> {
    const lockVersion = workPackage.lockVersion;
    if (lockVersion === undefined) {
      throw new OpenProjectError("Work package payload did not include lockVersion.");
    }

    const updateFormHref = nestedGet(workPackage, ["_links", "update", "href"], "") as string;
    if (!updateFormHref) {
      return this.resolveStatus(statusName);
    }

    let formData: unknown;
    try {
      const formPath = this.toApiPath(updateFormHref);
      formData = await this.request("POST", formPath, {
        payload: { lockVersion },
        expectedStatuses: [200],
      });
    } catch (err) {
      if (
        err instanceof OpenProjectError &&
        (err.statusCode === 404 || err.statusCode === 405 || err.statusCode === 422)
      ) {
        return this.resolveStatus(statusName);
      }
      throw err;
    }

    const allowedValues = nestedGet(
      formData,
      ["_embedded", "schema", "status", "_embedded", "allowedValues"],
      [],
    ) as HalResource[];

    if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
      return this.resolveStatus(statusName);
    }

    const lowered = statusName.trim().toLowerCase();
    const available: string[] = [];
    for (const status of allowedValues) {
      if (!status || typeof status !== "object") continue;
      const name = String((status as Status).name || "").trim();
      const href = (nestedGet(status, ["_links", "self", "href"], "") as string) || "";
      if (name) available.push(name);
      if (name && name.toLowerCase() === lowered) {
        return { name, href: href || `${API_PREFIX}/statuses/${(status as Status).id}` };
      }
    }

    if (available.length > 0) {
      throw new OpenProjectError(
        `Status '${statusName}' is not an allowed transition for this work package. Allowed statuses: ${[...new Set(available)].sort().join(", ")}`,
      );
    }

    return this.resolveStatus(statusName);
  }

  async resolveType(projectId: number | null, typeName: string): Promise<ResolvedEntity> {
    const lowered = typeName.trim().toLowerCase();
    const endpoints: string[] = [];
    if (projectId !== null) {
      endpoints.push(`/projects/${projectId}/types`);
    }
    endpoints.push("/types");

    const available: string[] = [];
    for (const endpoint of endpoints) {
      let data: unknown;
      try {
        data = await this.request("GET", endpoint);
      } catch (err) {
        if (err instanceof OpenProjectError && (err.statusCode === 404 || err.statusCode === 405)) {
          continue;
        }
        throw err;
      }

      for (const item of extractEmbeddedElements(data)) {
        const name = String((item as Type).name || "").trim();
        const href = (nestedGet(item, ["_links", "self", "href"], "") as string) || "";
        if (name) available.push(name);
        if (name && name.toLowerCase() === lowered) {
          return { name, href: href || `${API_PREFIX}/types/${(item as Type).id}` };
        }
      }
    }

    if (available.length > 0) {
      throw new OpenProjectError(
        `Unknown type '${typeName}'. Available types: ${[...new Set(available)].sort().join(", ")}`,
      );
    }
    throw new OpenProjectError("Could not resolve type list from OpenProject.");
  }

  async resolvePriority(priorityName: string): Promise<ResolvedEntity> {
    const lowered = priorityName.trim().toLowerCase();
    const priorities = await this.getPriorities();
    const available: string[] = [];

    for (const priority of priorities) {
      const name = String(priority.name || "").trim();
      const href = (nestedGet(priority, ["_links", "self", "href"], "") as string) || "";
      if (name) available.push(name);
      if (name && name.toLowerCase() === lowered) {
        return { name, href: href || `${API_PREFIX}/priorities/${priority.id}` };
      }
    }

    if (available.length > 0) {
      throw new OpenProjectError(
        `Unknown priority '${priorityName}'. Available priorities: ${[...new Set(available)].sort().join(", ")}`,
      );
    }
    throw new OpenProjectError("No priorities were returned by OpenProject.");
  }

  async resolveUser(userRef: string): Promise<ResolvedEntity> {
    const target = userRef.trim();
    if (!target) throw new OpenProjectError("Assignee value is empty.");

    if (/^\d+$/.test(target)) {
      const userId = parseInt(target, 10);
      const user = (await this.request("GET", `/users/${userId}`)) as User;
      const name = userDisplayName(user);
      return { name, href: `${API_PREFIX}/users/${userId}` };
    }

    let users: User[];
    try {
      users = await this.getUsers(500);
    } catch (err) {
      if (err instanceof OpenProjectError && err.statusCode === 403) {
        throw new OpenProjectError(
          "Cannot resolve assignee by name because user listing is not permitted. Use numeric user ID.",
        );
      }
      throw err;
    }

    const lowered = target.toLowerCase();
    let exactMatch: User | null = null;
    let partialMatch: User | null = null;

    for (const user of users) {
      const keys = userIdentityKeys(user);
      const loweredKeys = keys.map((k) => k.toLowerCase());
      if (loweredKeys.includes(lowered)) {
        exactMatch = user;
        break;
      }
      if (!partialMatch && loweredKeys.some((k) => k.includes(lowered))) {
        partialMatch = user;
      }
    }

    const selected = exactMatch || partialMatch;
    if (!selected) {
      const names = [...new Set(users.map(userDisplayName).filter((n) => n !== "-" && n !== ""))].sort();
      const hint = names.length > 0 ? names.slice(0, 12).join(", ") : "No visible users found.";
      throw new OpenProjectError(
        `Unknown user '${userRef}'. Use numeric user ID, login, or exact display name. Known users: ${hint}`,
      );
    }

    const href =
      (nestedGet(selected, ["_links", "self", "href"], "") as string) ||
      (selected.id !== undefined ? `${API_PREFIX}/users/${selected.id}` : "");
    if (!href) throw new OpenProjectError("Resolved user did not include a self href or id.");
    return { name: userDisplayName(selected), href };
  }

  // --- Work packages ---

  async listWorkPackages(
    projectId: number,
    options: { limit?: number; statusFilter?: string; assigneeFilter?: string } = {},
  ): Promise<WorkPackage[]> {
    const { limit = 50, statusFilter, assigneeFilter } = options;
    const params: Record<string, string | number> = {};
    if (statusFilter) params.status = statusFilter;
    if (assigneeFilter) params.assignee = assigneeFilter;

    const path = `/projects/${projectId}/work_packages`;
    try {
      return (await this.collectCollection(path, params, limit)) as WorkPackage[];
    } catch (err) {
      if (
        (statusFilter || assigneeFilter) &&
        err instanceof OpenProjectError &&
        (err.statusCode === 400 || err.statusCode === 422)
      ) {
        return (await this.collectCollection(path, {}, limit)) as WorkPackage[];
      }
      throw err;
    }
  }

  async getWorkPackage(id: number): Promise<WorkPackage> {
    return (await this.request("GET", `/work_packages/${id}`)) as WorkPackage;
  }

  async createWorkPackage(
    project: Project,
    subject: string,
    typeName = "Task",
    description?: string,
  ): Promise<WorkPackage> {
    const projectId = project.id;
    const projectHref =
      (nestedGet(project, ["_links", "self", "href"], "") as string) ||
      `${API_PREFIX}/projects/${projectId}`;
    const { href: typeHref } = await this.resolveType(projectId, typeName);

    const payload: Record<string, unknown> = {
      subject,
      _links: {
        project: { href: projectHref },
        type: { href: typeHref },
      },
    };
    if (description) {
      payload.description = { raw: description };
    }

    return (await this.request("POST", "/work_packages", {
      payload,
      expectedStatuses: [200, 201],
    })) as WorkPackage;
  }

  async updateWorkPackageStatus(id: number, statusName: string): Promise<WorkPackage> {
    const wp = await this.getWorkPackage(id);
    if (wp.lockVersion === undefined) {
      throw new OpenProjectError("Work package payload did not include lockVersion.");
    }

    const { href: statusHref } = await this.resolveAllowedTransitionStatus(wp, statusName);
    const updateHref = nestedGet(wp, ["_links", "updateImmediately", "href"], "") as string;
    const patchPath = updateHref ? this.toApiPath(updateHref) : `/work_packages/${id}`;

    try {
      return (await this.request("PATCH", patchPath, {
        payload: {
          lockVersion: wp.lockVersion,
          _links: { status: { href: statusHref } },
        },
      })) as WorkPackage;
    } catch (err) {
      if (err instanceof OpenProjectError && err.statusCode === 422) {
        throw new OpenProjectError(`Status update rejected by workflow for work package #${id}. ${err.message}`);
      }
      throw err;
    }
  }

  async updateWorkPackage(
    id: number,
    fields: {
      subject?: string;
      description?: string;
      statusName?: string;
      assigneeRef?: string;
      priorityName?: string;
      typeName?: string;
      startDate?: string;
      dueDate?: string;
    },
  ): Promise<WorkPackage> {
    const wp = await this.getWorkPackage(id);
    if (wp.lockVersion === undefined) {
      throw new OpenProjectError("Work package payload did not include lockVersion.");
    }

    const payload: Record<string, unknown> = { lockVersion: wp.lockVersion };

    if (fields.subject !== undefined) payload.subject = fields.subject;
    if (fields.description !== undefined) payload.description = { raw: fields.description };
    if (fields.startDate !== undefined) payload.startDate = fields.startDate;
    if (fields.dueDate !== undefined) payload.dueDate = fields.dueDate;

    const linkUpdates: Record<string, { href: string }> = {};

    if (fields.statusName) {
      const { href } = await this.resolveAllowedTransitionStatus(wp, fields.statusName);
      linkUpdates.status = { href };
    }
    if (fields.priorityName) {
      const { href } = await this.resolvePriority(fields.priorityName);
      linkUpdates.priority = { href };
    }
    if (fields.assigneeRef) {
      const { href } = await this.resolveUser(fields.assigneeRef);
      linkUpdates.assignee = { href };
    }
    if (fields.typeName) {
      const projectHref = nestedGet(wp, ["_links", "project", "href"], "") as string;
      const projectId = extractNumericIdFromHref(projectHref, "projects");
      const { href } = await this.resolveType(projectId, fields.typeName);
      linkUpdates.type = { href };
    }

    if (Object.keys(linkUpdates).length > 0) {
      payload._links = linkUpdates;
    }

    if (Object.keys(payload).length <= 1) {
      throw new OpenProjectError("No fields provided to update.");
    }

    const updateHref = nestedGet(wp, ["_links", "updateImmediately", "href"], "") as string;
    const patchPath = updateHref ? this.toApiPath(updateHref) : `/work_packages/${id}`;

    try {
      return (await this.request("PATCH", patchPath, { payload })) as WorkPackage;
    } catch (err) {
      if (err instanceof OpenProjectError && err.statusCode === 422) {
        throw new OpenProjectError(`Work package update rejected for #${id}. ${err.message}`);
      }
      throw err;
    }
  }

  async addComment(id: number, comment: string): Promise<unknown> {
    const wp = await this.getWorkPackage(id);

    // Strategy 1: addComment link
    const addCommentLink = nestedGet(wp, ["_links", "addComment"], null) as Record<string, unknown> | null;
    if (addCommentLink && typeof addCommentLink === "object") {
      const commentHref = addCommentLink.href as string;
      const method = (String(addCommentLink.method || "post")).toUpperCase();
      if (commentHref && (method === "POST" || method === "PATCH")) {
        try {
          return await this.request(method, this.toApiPath(commentHref), {
            payload: { comment: { raw: comment } },
            expectedStatuses: [200, 201],
          });
        } catch (err) {
          if (
            err instanceof OpenProjectError &&
            [400, 404, 405, 415, 422].includes(err.statusCode || 0)
          ) {
            // Fall through to next strategy
          } else {
            throw err;
          }
        }
      }
    }

    // Strategy 2: PATCH with comment field
    if (wp.lockVersion !== undefined) {
      const updateHref = nestedGet(wp, ["_links", "updateImmediately", "href"], "") as string;
      const patchPath = updateHref ? this.toApiPath(updateHref) : `/work_packages/${id}`;
      try {
        return await this.request("PATCH", patchPath, {
          payload: { lockVersion: wp.lockVersion, comment: { raw: comment } },
        });
      } catch (err) {
        if (
          err instanceof OpenProjectError &&
          [400, 404, 405, 415, 422].includes(err.statusCode || 0)
        ) {
          // Fall through
        } else {
          throw err;
        }
      }
    }

    // Strategy 3: POST to activities
    const activitiesHref = nestedGet(wp, ["_links", "activities", "href"], "") as string;
    const fallbackPath = activitiesHref
      ? this.toApiPath(activitiesHref)
      : `/work_packages/${id}/activities`;
    try {
      return await this.request("POST", fallbackPath, {
        payload: { comment: { raw: comment } },
        expectedStatuses: [200, 201],
      });
    } catch {
      throw new OpenProjectError(
        "Unable to add comment. API v3 comment creation is not available on this server/version.",
      );
    }
  }

  // --- Relations ---

  async listWorkPackageRelations(wpId: number, limit = 100): Promise<Relation[]> {
    try {
      return (await this.collectCollection(
        `/work_packages/${wpId}/relations`,
        undefined,
        limit,
      )) as Relation[];
    } catch (err) {
      if (err instanceof OpenProjectError && (err.statusCode === 404 || err.statusCode === 405)) {
        const filters = JSON.stringify([
          { involved: { operator: "=", values: [String(wpId)] } },
        ]);
        return (await this.collectCollection("/relations", { filters }, limit)) as Relation[];
      }
      throw err;
    }
  }

  async createRelation(
    fromId: number,
    toId: number,
    relationType: string,
    description?: string,
    lag?: number,
  ): Promise<Relation> {
    const normalized = relationType.trim().toLowerCase();
    if (!RELATION_TYPES.has(normalized)) {
      throw new OpenProjectError(
        `Unsupported relation type '${relationType}'. Allowed types: ${[...RELATION_TYPES].sort().join(", ")}`,
      );
    }

    const payload: Record<string, unknown> = {
      type: normalized,
      _links: { to: { href: `${API_PREFIX}/work_packages/${toId}` } },
    };
    if (description !== undefined) payload.description = description;
    if (lag !== undefined) payload.lag = lag;

    return (await this.request("POST", `/work_packages/${fromId}/relations`, {
      payload,
      expectedStatuses: [200, 201],
    })) as Relation;
  }

  // --- Helpers ---

  private toApiPath(urlOrPath: string): string {
    let value = (urlOrPath || "").trim();
    if (!value) return "/";
    if (value.includes("://")) {
      try {
        const parsed = new URL(value);
        value = parsed.pathname;
      } catch {
        return "/";
      }
    }
    if (value.startsWith(API_PREFIX)) {
      value = value.slice(API_PREFIX.length) || "/";
    }
    if (!value.startsWith("/")) {
      value = `/${value}`;
    }
    return value;
  }
}
