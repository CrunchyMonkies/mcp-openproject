import { describe, test, expect, beforeAll } from "vitest";
import { getTestClient } from "./setup.js";
import type { OpenProjectClient } from "../../src/client/index.js";

let client: OpenProjectClient;

beforeAll(async () => {
  client = getTestClient();
});

describe("Notifications (read-only)", () => {
  test("lists notifications and returns array", async () => {
    try {
      const notifications = await client.listNotifications();
      expect(Array.isArray(notifications)).toBe(true);

      for (const n of notifications) {
        expect(typeof n.id).toBe("number");
        expect(n.id).toBeGreaterThan(0);
      }
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] listNotifications: 403 Forbidden, skipping");
        return;
      }
      throw err;
    }
  });

  test("gets first notification by id if notifications exist", async () => {
    let notifications;
    try {
      notifications = await client.listNotifications();
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] listNotifications: 403 Forbidden, skipping getNotification test");
        return;
      }
      throw err;
    }

    if (notifications.length === 0) {
      console.warn("[e2e] No notifications found, skipping getNotification test");
      return;
    }

    const firstId = notifications[0].id;
    try {
      const notification = await client.getNotification(firstId);
      expect(typeof notification.id).toBe("number");
      expect(notification.id).toBe(firstId);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("403")) {
        console.warn("[e2e] getNotification: 403 Forbidden, skipping");
        return;
      }
      throw err;
    }
  });
});
