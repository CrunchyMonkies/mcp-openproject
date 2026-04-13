import {
  ViewSchema,
  type View,
  type CreateViewInput,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerViewMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listViews = async function(
    this: OpenProjectClient,
    options: { limit?: number } = {},
  ): Promise<View[]> {
    const { limit = 50 } = options;
    const elements = await this.collectCollection("/views", undefined, limit);
    return elements.map(e => this.parseResponse(ViewSchema, e, "listViews[]"));
  };

  Client.prototype.getView = async function(this: OpenProjectClient, id: number): Promise<View> {
    const data = await this.request("GET", `/views/${id}`);
    return this.parseResponse(ViewSchema, data, "getView");
  };

  Client.prototype.createView = async function(
    this: OpenProjectClient,
    type: string,
    input: CreateViewInput,
  ): Promise<View> {
    const data = await this.request("POST", `/views/${type}`, {
      payload: input,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(ViewSchema, data, "createView");
  };

  Client.prototype.updateView = async function(
    this: OpenProjectClient,
    id: number,
    input: Partial<CreateViewInput>,
  ): Promise<View> {
    const data = await this.request("PATCH", `/views/${id}`, {
      payload: input,
      expectedStatuses: [200],
    });
    return this.parseResponse(ViewSchema, data, "updateView");
  };

  Client.prototype.deleteView = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/views/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
