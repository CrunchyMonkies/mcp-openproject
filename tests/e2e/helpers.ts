import type { OpenProjectClient } from "../../src/client/index.js";

export class TestDataTracker {
  private createdWpIds: number[] = [];

  trackWorkPackage(id: number): void {
    this.createdWpIds.push(id);
  }

  async cleanup(client: OpenProjectClient): Promise<void> {
    for (const id of this.createdWpIds) {
      try {
        await client.updateWorkPackage(id, {
          subject: `[E2E-CLEANUP] ${id}`,
          statusName: "Closed",
        });
      } catch {
        try {
          await client.updateWorkPackage(id, {
            subject: `[E2E-CLEANUP] ${id}`,
            statusName: "Rejected",
          });
        } catch {
          console.error(`[e2e cleanup] Could not close WP #${id}`);
        }
      }
    }
  }
}
