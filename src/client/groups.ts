import {
  GroupSchema,
  type Group,
  type CreateGroupInput,
  type UpdateGroupInput,
} from "../schemas/index.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerGroupMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listGroups = async function(this: OpenProjectClient, limit = 100): Promise<Group[]> {
    const elements = await this.collectCollection("/groups", undefined, limit);
    return elements.map(e => this.parseResponse(GroupSchema, e, "listGroups[]"));
  };

  Client.prototype.getGroup = async function(this: OpenProjectClient, id: number): Promise<Group> {
    const data = await this.request("GET", `/groups/${id}`);
    return this.parseResponse(GroupSchema, data, "getGroup");
  };

  Client.prototype.createGroup = async function(
    this: OpenProjectClient,
    input: CreateGroupInput,
  ): Promise<Group> {
    const payload: Record<string, unknown> = { name: input.name };
    if (input.memberIds !== undefined) {
      payload._links = {
        members: input.memberIds.map((id: number) => ({ href: `${API_PREFIX}/users/${id}` })),
      };
    }
    const data = await this.request("POST", "/groups", {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(GroupSchema, data, "createGroup");
  };

  Client.prototype.updateGroup = async function(
    this: OpenProjectClient,
    id: number,
    input: UpdateGroupInput,
  ): Promise<Group> {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.memberIds !== undefined) {
      payload._links = {
        members: input.memberIds.map((mid: number) => ({ href: `${API_PREFIX}/users/${mid}` })),
      };
    }
    const data = await this.request("PATCH", `/groups/${id}`, {
      payload,
      expectedStatuses: [200],
    });
    return this.parseResponse(GroupSchema, data, "updateGroup");
  };

  Client.prototype.deleteGroup = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/groups/${id}`, {
      expectedStatuses: [200, 202, 204],
    });
  };
}
