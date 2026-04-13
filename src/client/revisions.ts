import { extractEmbeddedElements } from "../helpers.js";
import {
  RevisionSchema,
  type Revision,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerRevisionMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listRevisions = async function(this: OpenProjectClient, projectId: number): Promise<Revision[]> {
    const data = await this.request("GET", `/projects/${projectId}/revisions`);
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(RevisionSchema, e, "listRevisions[]"));
  };

  Client.prototype.getRevision = async function(this: OpenProjectClient, id: number): Promise<Revision> {
    const data = await this.request("GET", `/revisions/${id}`);
    return this.parseResponse(RevisionSchema, data, "getRevision");
  };
}
