import {
  NewsSchema,
  type News,
  type CreateNewsInput,
  type UpdateNewsInput,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerNewsMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listNews = async function(
    this: OpenProjectClient,
    options: { projectId?: number; limit?: number } = {},
  ): Promise<News[]> {
    const { projectId, limit = 50 } = options;
    const path = projectId !== undefined ? `/projects/${projectId}/news` : "/news";
    const elements = await this.collectCollection(path, undefined, limit);
    return elements.map(e => this.parseResponse(NewsSchema, e, "listNews[]"));
  };

  Client.prototype.getNews = async function(this: OpenProjectClient, id: number): Promise<News> {
    const data = await this.request("GET", `/news/${id}`);
    return this.parseResponse(NewsSchema, data, "getNews");
  };

  Client.prototype.createNews = async function(
    this: OpenProjectClient,
    input: CreateNewsInput,
  ): Promise<News> {
    const payload: Record<string, unknown> = { title: input.title };
    if (input.summary !== undefined) payload.summary = input.summary;
    if (input.description !== undefined) payload.description = { raw: input.description };
    const data = await this.request("POST", `/projects/${input.projectId}/news`, {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(NewsSchema, data, "createNews");
  };

  Client.prototype.updateNews = async function(
    this: OpenProjectClient,
    id: number,
    input: UpdateNewsInput,
  ): Promise<News> {
    const payload: Record<string, unknown> = {};
    if (input.title !== undefined) payload.title = input.title;
    if (input.summary !== undefined) payload.summary = input.summary;
    if (input.description !== undefined) payload.description = { raw: input.description };
    const data = await this.request("PATCH", `/news/${id}`, {
      payload,
      expectedStatuses: [200],
    });
    return this.parseResponse(NewsSchema, data, "updateNews");
  };

  Client.prototype.deleteNews = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/news/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
