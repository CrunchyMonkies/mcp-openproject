import {
  QuerySchema,
  type Query,
  type CreateQueryInput,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerQueryMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listQueries = async function(
    this: OpenProjectClient,
    options: { projectId?: number; limit?: number } = {},
  ): Promise<Query[]> {
    const { projectId, limit = 50 } = options;
    const params: Record<string, string | number> = {};
    if (projectId !== undefined) params.projectId = projectId;
    const elements = await this.collectCollection("/queries", params, limit);
    return elements.map(e => this.parseResponse(QuerySchema, e, "listQueries[]"));
  };

  Client.prototype.getQuery = async function(this: OpenProjectClient, id: number): Promise<Query> {
    const data = await this.request("GET", `/queries/${id}`);
    return this.parseResponse(QuerySchema, data, "getQuery");
  };

  Client.prototype.createQuery = async function(
    this: OpenProjectClient,
    input: CreateQueryInput,
  ): Promise<Query> {
    const data = await this.request("POST", "/queries", {
      payload: input,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(QuerySchema, data, "createQuery");
  };

  Client.prototype.updateQuery = async function(
    this: OpenProjectClient,
    id: number,
    input: Partial<CreateQueryInput>,
  ): Promise<Query> {
    const data = await this.request("PATCH", `/queries/${id}`, {
      payload: input,
      expectedStatuses: [200],
    });
    return this.parseResponse(QuerySchema, data, "updateQuery");
  };

  Client.prototype.deleteQuery = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/queries/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
