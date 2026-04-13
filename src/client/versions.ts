import {
  VersionSchema,
  type Version,
  type CreateVersionInput,
  type UpdateVersionInput,
} from "../schemas/index.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerVersionMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listVersions = async function(this: OpenProjectClient, projectId: number): Promise<Version[]> {
    const elements = await this.collectCollection(`/projects/${projectId}/versions`, undefined, 200);
    return elements.map(e => this.parseResponse(VersionSchema, e, "listVersions[]"));
  };

  Client.prototype.getVersion = async function(this: OpenProjectClient, id: number): Promise<Version> {
    const data = await this.request("GET", `/versions/${id}`);
    return this.parseResponse(VersionSchema, data, "getVersion");
  };

  Client.prototype.createVersion = async function(
    this: OpenProjectClient,
    input: CreateVersionInput,
  ): Promise<Version> {
    const payload: Record<string, unknown> = {
      name: input.name,
      _links: {
        definingProject: { href: `${API_PREFIX}/projects/${input.projectId}` },
      },
    };
    if (input.description !== undefined) payload.description = { raw: input.description };
    if (input.startDate !== undefined) payload.startDate = input.startDate;
    if (input.endDate !== undefined) payload.endDate = input.endDate;
    if (input.status !== undefined) payload.status = input.status;
    if (input.sharing !== undefined) payload.sharing = input.sharing;

    const data = await this.request("POST", `/projects/${input.projectId}/versions`, {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(VersionSchema, data, "createVersion");
  };

  Client.prototype.updateVersion = async function(
    this: OpenProjectClient,
    id: number,
    input: UpdateVersionInput,
  ): Promise<Version> {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = { raw: input.description };
    if (input.startDate !== undefined) payload.startDate = input.startDate;
    if (input.endDate !== undefined) payload.endDate = input.endDate;
    if (input.status !== undefined) payload.status = input.status;
    if (input.sharing !== undefined) payload.sharing = input.sharing;

    const data = await this.request("PATCH", `/versions/${id}`, {
      payload,
      expectedStatuses: [200],
    });
    return this.parseResponse(VersionSchema, data, "updateVersion");
  };

  Client.prototype.deleteVersion = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/versions/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
