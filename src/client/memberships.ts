import {
  MembershipSchema,
  type Membership,
  type CreateMembershipInput,
  type UpdateMembershipInput,
} from "../schemas/index.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerMembershipMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listMemberships = async function(
    this: OpenProjectClient,
    options: { projectId?: number; limit?: number } = {},
  ): Promise<Membership[]> {
    const { projectId, limit = 100 } = options;
    const params: Record<string, string | number> = {};
    if (projectId !== undefined) {
      params.filters = JSON.stringify([{ project: { operator: "=", values: [String(projectId)] } }]);
    }
    const elements = await this.collectCollection("/memberships", params, limit);
    return elements.map(e => this.parseResponse(MembershipSchema, e, "listMemberships[]"));
  };

  Client.prototype.getMembership = async function(this: OpenProjectClient, id: number): Promise<Membership> {
    const data = await this.request("GET", `/memberships/${id}`);
    return this.parseResponse(MembershipSchema, data, "getMembership");
  };

  Client.prototype.createMembership = async function(
    this: OpenProjectClient,
    input: CreateMembershipInput,
  ): Promise<Membership> {
    const payload: Record<string, unknown> = {
      _links: {
        project: { href: `${API_PREFIX}/projects/${input.projectId}` },
        principal: { href: `${API_PREFIX}/users/${input.principalId}` },
        roles: input.roleIds.map((id: number) => ({ href: `${API_PREFIX}/roles/${id}` })),
      },
    };
    const data = await this.request("POST", "/memberships", {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(MembershipSchema, data, "createMembership");
  };

  Client.prototype.updateMembership = async function(
    this: OpenProjectClient,
    id: number,
    input: UpdateMembershipInput,
  ): Promise<Membership> {
    const payload: Record<string, unknown> = {};
    if (input.roleIds !== undefined) {
      payload._links = {
        roles: input.roleIds.map((rid: number) => ({ href: `${API_PREFIX}/roles/${rid}` })),
      };
    }
    const data = await this.request("PATCH", `/memberships/${id}`, {
      payload,
      expectedStatuses: [200],
    });
    return this.parseResponse(MembershipSchema, data, "updateMembership");
  };

  Client.prototype.deleteMembership = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/memberships/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
