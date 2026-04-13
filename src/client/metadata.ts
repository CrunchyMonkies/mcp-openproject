import { OpenProjectError } from "../errors.js";
import { extractEmbeddedElements, nestedGet } from "../helpers.js";
import {
  StatusSchema,
  TypeSchema,
  PrioritySchema,
  RoleSchema,
  CategorySchema,
  type Status,
  type Type,
  type Priority,
  type Role,
  type Category,
  type WorkPackage,
  type HalResource,
} from "../schemas/index.js";
import type { ResolvedEntity } from "../types.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerMetadataMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getStatuses = async function(this: OpenProjectClient): Promise<Status[]> {
    const data = await this.request("GET", "/statuses");
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(StatusSchema, e, "getStatuses[]"));
  };

  Client.prototype.getPriorities = async function(this: OpenProjectClient): Promise<Priority[]> {
    const data = await this.request("GET", "/priorities");
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(PrioritySchema, e, "getPriorities[]"));
  };

  Client.prototype.getTypes = async function(this: OpenProjectClient, projectId?: number): Promise<Type[]> {
    const endpoints: string[] = [];
    if (projectId !== undefined) {
      endpoints.push(`/projects/${projectId}/types`);
    }
    endpoints.push("/types");

    for (const endpoint of endpoints) {
      try {
        const data = await this.request("GET", endpoint);
        const elements = extractEmbeddedElements(data);
        const typed = elements.map(e => this.parseResponse(TypeSchema, e, "getTypes[]"));
        if (typed.length > 0) return typed;
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
  };

  Client.prototype.getRoles = async function(this: OpenProjectClient, limit = 100): Promise<Role[]> {
    const elements = await this.collectCollection("/roles", undefined, limit);
    return elements.map(e => this.parseResponse(RoleSchema, e, "getRoles[]"));
  };

  Client.prototype.getRole = async function(this: OpenProjectClient, id: number): Promise<Role> {
    const data = await this.request("GET", `/roles/${id}`);
    return this.parseResponse(RoleSchema, data, "getRole");
  };

  Client.prototype.getCategories = async function(this: OpenProjectClient, projectId: number): Promise<Category[]> {
    const data = await this.request("GET", `/projects/${projectId}/categories`);
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(CategorySchema, e, "getCategories[]"));
  };

  Client.prototype.getCategory = async function(this: OpenProjectClient, id: number): Promise<Category> {
    const data = await this.request("GET", `/categories/${id}`);
    return this.parseResponse(CategorySchema, data, "getCategory");
  };

  Client.prototype.resolveStatus = async function(this: OpenProjectClient, statusName: string): Promise<ResolvedEntity> {
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
  };

  Client.prototype.resolveAllowedTransitionStatus = async function(
    this: OpenProjectClient,
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
  };

  Client.prototype.resolveType = async function(
    this: OpenProjectClient,
    projectId: number | null,
    typeName: string,
  ): Promise<ResolvedEntity> {
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
  };

  Client.prototype.resolvePriority = async function(this: OpenProjectClient, priorityName: string): Promise<ResolvedEntity> {
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
  };

  Client.prototype.getWorkPackageSchema = async function(this: OpenProjectClient, projectId?: number): Promise<unknown> {
    const path = projectId !== undefined
      ? `/projects/${projectId}/work_packages/schema`
      : "/work_packages/schema";
    return this.request("GET", path);
  };

  Client.prototype.getProjectSchema = async function(this: OpenProjectClient): Promise<unknown> {
    return this.request("GET", "/projects/schema");
  };
}
