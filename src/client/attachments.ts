import {
  AttachmentSchema,
  type Attachment,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerAttachmentMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getAttachment = async function(this: OpenProjectClient, id: number): Promise<Attachment> {
    const data = await this.request("GET", `/attachments/${id}`);
    return this.parseResponse(AttachmentSchema, data, "getAttachment");
  };

  Client.prototype.deleteAttachment = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/attachments/${id}`, {
      expectedStatuses: [200, 204],
    });
  };
}
