import { extractEmbeddedElements } from "../helpers.js";
import {
  FileLinkSchema,
  type FileLink,
  type CreateFileLinkInput,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerFileLinkMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listFileLinks = async function(this: OpenProjectClient, wpId: number): Promise<FileLink[]> {
    const data = await this.request("GET", `/work_packages/${wpId}/file_links`);
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(FileLinkSchema, e, "listFileLinks[]"));
  };

  Client.prototype.getFileLink = async function(this: OpenProjectClient, id: number): Promise<FileLink> {
    const data = await this.request("GET", `/file_links/${id}`);
    return this.parseResponse(FileLinkSchema, data, "getFileLink");
  };

  Client.prototype.createFileLink = async function(
    this: OpenProjectClient,
    wpId: number,
    input: CreateFileLinkInput,
  ): Promise<FileLink> {
    const data = await this.request("POST", `/work_packages/${wpId}/file_links`, {
      payload: input,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(FileLinkSchema, data, "createFileLink");
  };

  Client.prototype.deleteFileLink = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/file_links/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
