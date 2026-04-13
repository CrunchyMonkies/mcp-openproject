import {
  DocumentSchema,
  type Document,
  type UpdateDocumentInput,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerDocumentMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listDocuments = async function(
    this: OpenProjectClient,
    options: { projectId?: number; limit?: number } = {},
  ): Promise<Document[]> {
    const { projectId, limit = 50 } = options;
    const path = projectId !== undefined ? `/projects/${projectId}/documents` : "/documents";
    const elements = await this.collectCollection(path, undefined, limit);
    return elements.map(e => this.parseResponse(DocumentSchema, e, "listDocuments[]"));
  };

  Client.prototype.getDocument = async function(this: OpenProjectClient, id: number): Promise<Document> {
    const data = await this.request("GET", `/documents/${id}`);
    return this.parseResponse(DocumentSchema, data, "getDocument");
  };

  Client.prototype.updateDocument = async function(
    this: OpenProjectClient,
    id: number,
    input: UpdateDocumentInput,
  ): Promise<Document> {
    const data = await this.request("PATCH", `/documents/${id}`, {
      payload: input,
      expectedStatuses: [200],
    });
    return this.parseResponse(DocumentSchema, data, "updateDocument");
  };
}
