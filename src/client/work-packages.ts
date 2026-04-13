import { OpenProjectError } from "../errors.js";
import { extractEmbeddedElements, extractNumericIdFromHref, nestedGet } from "../helpers.js";
import {
  WorkPackageSchema,
  type WorkPackage,
  type Project,
} from "../schemas/index.js";
import { API_PREFIX, RELATION_TYPES } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerWorkPackageMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listWorkPackages = async function(
    this: OpenProjectClient,
    projectId: number,
    options: { limit?: number; statusFilter?: string; assigneeFilter?: string } = {},
  ): Promise<WorkPackage[]> {
    const { limit = 50, statusFilter, assigneeFilter } = options;
    const params: Record<string, string | number> = {};
    if (statusFilter) params.status = statusFilter;
    if (assigneeFilter) params.assignee = assigneeFilter;

    const path = `/projects/${projectId}/work_packages`;
    try {
      const elements = await this.collectCollection(path, params, limit);
      return elements.map(e => this.parseResponse(WorkPackageSchema, e, "listWorkPackages[]"));
    } catch (err) {
      if (
        (statusFilter || assigneeFilter) &&
        err instanceof OpenProjectError &&
        (err.statusCode === 400 || err.statusCode === 422)
      ) {
        const elements = await this.collectCollection(path, {}, limit);
        return elements.map(e => this.parseResponse(WorkPackageSchema, e, "listWorkPackages[]"));
      }
      throw err;
    }
  };

  Client.prototype.getWorkPackage = async function(this: OpenProjectClient, id: number): Promise<WorkPackage> {
    const data = await this.request("GET", `/work_packages/${id}`);
    return this.parseResponse(WorkPackageSchema, data, "getWorkPackage");
  };

  Client.prototype.createWorkPackage = async function(
    this: OpenProjectClient,
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

    const data = await this.request("POST", "/work_packages", {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(WorkPackageSchema, data, "createWorkPackage");
  };

  Client.prototype.deleteWorkPackage = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/work_packages/${id}`, {
      expectedStatuses: [200, 204],
    });
  };

  Client.prototype.updateWorkPackageStatus = async function(
    this: OpenProjectClient,
    id: number,
    statusName: string,
  ): Promise<WorkPackage> {
    const wp = await this.getWorkPackage(id);
    if (wp.lockVersion === undefined) {
      throw new OpenProjectError("Work package payload did not include lockVersion.");
    }

    const { href: statusHref } = await this.resolveAllowedTransitionStatus(wp, statusName);
    const updateHref = nestedGet(wp, ["_links", "updateImmediately", "href"], "") as string;
    const patchPath = updateHref ? this.toApiPath(updateHref) : `/work_packages/${id}`;

    try {
      const data = await this.request("PATCH", patchPath, {
        payload: {
          lockVersion: wp.lockVersion,
          _links: { status: { href: statusHref } },
        },
      });
      return this.parseResponse(WorkPackageSchema, data, "updateWorkPackageStatus");
    } catch (err) {
      if (err instanceof OpenProjectError && err.statusCode === 422) {
        throw new OpenProjectError(`Status update rejected by workflow for work package #${id}. ${err.message}`);
      }
      throw err;
    }
  };

  Client.prototype.updateWorkPackage = async function(
    this: OpenProjectClient,
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
      const data = await this.request("PATCH", patchPath, { payload });
      return this.parseResponse(WorkPackageSchema, data, "updateWorkPackage");
    } catch (err) {
      if (err instanceof OpenProjectError && err.statusCode === 422) {
        throw new OpenProjectError(`Work package update rejected for #${id}. ${err.message}`);
      }
      throw err;
    }
  };

  Client.prototype.addComment = async function(
    this: OpenProjectClient,
    id: number,
    comment: string,
  ): Promise<unknown> {
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
  };
}
