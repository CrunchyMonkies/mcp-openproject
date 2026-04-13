import {
  CustomActionSchema,
  type CustomAction,
} from "../schemas/index.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerCustomActionMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getCustomAction = async function(this: OpenProjectClient, id: number): Promise<CustomAction> {
    const data = await this.request("GET", `/custom_actions/${id}`);
    return this.parseResponse(CustomActionSchema, data, "getCustomAction");
  };

  Client.prototype.executeCustomAction = async function(
    this: OpenProjectClient,
    id: number,
    wpId: number,
    lockVersion: number,
  ): Promise<unknown> {
    return this.request("POST", `/custom_actions/${id}/execute`, {
      payload: {
        lockVersion,
        _links: { workPackage: { href: `${API_PREFIX}/work_packages/${wpId}` } },
      },
      expectedStatuses: [200, 201],
    });
  };
}
