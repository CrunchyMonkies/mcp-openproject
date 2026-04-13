import {
  NotificationSchema,
  type Notification,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerNotificationMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listNotifications = async function(
    this: OpenProjectClient,
    options: { limit?: number } = {},
  ): Promise<Notification[]> {
    const { limit = 50 } = options;
    const elements = await this.collectCollection("/notifications", undefined, limit);
    return elements.map(e => this.parseResponse(NotificationSchema, e, "listNotifications[]"));
  };

  Client.prototype.getNotification = async function(this: OpenProjectClient, id: number): Promise<Notification> {
    const data = await this.request("GET", `/notifications/${id}`);
    return this.parseResponse(NotificationSchema, data, "getNotification");
  };

  Client.prototype.markNotificationRead = async function(this: OpenProjectClient, id: number): Promise<Notification> {
    const data = await this.request("PATCH", `/notifications/${id}`, {
      payload: { readIAN: true },
      expectedStatuses: [200],
    });
    return this.parseResponse(NotificationSchema, data, "markNotificationRead");
  };
}
