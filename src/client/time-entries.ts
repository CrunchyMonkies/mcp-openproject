import {
  TimeEntrySchema,
  type TimeEntry,
  type CreateTimeEntryInput,
  type UpdateTimeEntryInput,
} from "../schemas/index.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerTimeEntryMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listTimeEntries = async function(
    this: OpenProjectClient,
    options: { projectId?: number; workPackageId?: number; limit?: number } = {},
  ): Promise<TimeEntry[]> {
    const { projectId, workPackageId, limit = 50 } = options;
    const filters: Record<string, unknown>[] = [];
    if (projectId !== undefined) {
      filters.push({ project: { operator: "=", values: [String(projectId)] } });
    }
    if (workPackageId !== undefined) {
      filters.push({ work_package: { operator: "=", values: [String(workPackageId)] } });
    }
    const params: Record<string, string | number> = {};
    if (filters.length > 0) {
      params.filters = JSON.stringify(filters);
    }
    const elements = await this.collectCollection("/time_entries", params, limit);
    return elements.map(e => this.parseResponse(TimeEntrySchema, e, "listTimeEntries[]"));
  };

  Client.prototype.getTimeEntry = async function(this: OpenProjectClient, id: number): Promise<TimeEntry> {
    const data = await this.request("GET", `/time_entries/${id}`);
    return this.parseResponse(TimeEntrySchema, data, "getTimeEntry");
  };

  Client.prototype.createTimeEntry = async function(
    this: OpenProjectClient,
    input: CreateTimeEntryInput,
  ): Promise<TimeEntry> {
    const payload: Record<string, unknown> = {
      hours: input.hours,
      spentOn: input.spentOn,
      _links: {
        workPackage: { href: `${API_PREFIX}/work_packages/${input.workPackageId}` },
      },
    };
    if (input.comment !== undefined) {
      payload.comment = { raw: input.comment };
    }
    if (input.projectId !== undefined) {
      (payload._links as Record<string, unknown>).project = { href: `${API_PREFIX}/projects/${input.projectId}` };
    }
    if (input.activityId !== undefined) {
      (payload._links as Record<string, unknown>).activity = { href: `${API_PREFIX}/time_entries/activities/${input.activityId}` };
    }
    const data = await this.request("POST", "/time_entries", {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(TimeEntrySchema, data, "createTimeEntry");
  };

  Client.prototype.updateTimeEntry = async function(
    this: OpenProjectClient,
    id: number,
    input: UpdateTimeEntryInput,
  ): Promise<TimeEntry> {
    const payload: Record<string, unknown> = {};
    if (input.hours !== undefined) payload.hours = input.hours;
    if (input.spentOn !== undefined) payload.spentOn = input.spentOn;
    if (input.comment !== undefined) payload.comment = { raw: input.comment };
    if (input.activityId !== undefined) {
      payload._links = { activity: { href: `${API_PREFIX}/time_entries/activities/${input.activityId}` } };
    }
    const data = await this.request("PATCH", `/time_entries/${id}`, {
      payload,
      expectedStatuses: [200],
    });
    return this.parseResponse(TimeEntrySchema, data, "updateTimeEntry");
  };

  Client.prototype.deleteTimeEntry = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/time_entries/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
