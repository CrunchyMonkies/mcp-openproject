import { extractEmbeddedElements } from "../helpers.js";
import {
  ActivitySchema,
  type Activity,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerActivityMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listActivities = async function(this: OpenProjectClient, wpId: number): Promise<Activity[]> {
    const data = await this.request("GET", `/work_packages/${wpId}/activities`);
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(ActivitySchema, e, "listActivities[]"));
  };

  Client.prototype.getActivity = async function(this: OpenProjectClient, id: number): Promise<Activity> {
    const data = await this.request("GET", `/activities/${id}`);
    return this.parseResponse(ActivitySchema, data, "getActivity");
  };
}
