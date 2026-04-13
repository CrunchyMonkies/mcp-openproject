import { OpenProjectError } from "../errors.js";
import {
  RelationSchema,
  type Relation,
} from "../schemas/index.js";
import { API_PREFIX, RELATION_TYPES } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerRelationMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listWorkPackageRelations = async function(
    this: OpenProjectClient,
    wpId: number,
    limit = 100,
  ): Promise<Relation[]> {
    try {
      const elements = await this.collectCollection(
        `/work_packages/${wpId}/relations`,
        undefined,
        limit,
      );
      return elements.map(e => this.parseResponse(RelationSchema, e, "listWorkPackageRelations[]"));
    } catch (err) {
      if (err instanceof OpenProjectError && (err.statusCode === 404 || err.statusCode === 405)) {
        const filters = JSON.stringify([
          { involved: { operator: "=", values: [String(wpId)] } },
        ]);
        const elements = await this.collectCollection("/relations", { filters }, limit);
        return elements.map(e => this.parseResponse(RelationSchema, e, "listWorkPackageRelations[]"));
      }
      throw err;
    }
  };

  Client.prototype.getRelation = async function(this: OpenProjectClient, id: number): Promise<Relation> {
    const data = await this.request("GET", `/relations/${id}`);
    return this.parseResponse(RelationSchema, data, "getRelation");
  };

  Client.prototype.createRelation = async function(
    this: OpenProjectClient,
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

    const data = await this.request("POST", `/work_packages/${fromId}/relations`, {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(RelationSchema, data, "createRelation");
  };

  Client.prototype.deleteRelation = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/relations/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
