import {
  PrincipalSchema,
  type Principal,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerPrincipalMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listPrincipals = async function(
    this: OpenProjectClient,
    options: { projectId?: number; limit?: number } = {},
  ): Promise<Principal[]> {
    const { projectId, limit = 100 } = options;
    const params: Record<string, string | number> = {};
    if (projectId !== undefined) {
      params.filters = JSON.stringify([{ project: { operator: "=", values: [String(projectId)] } }]);
    }
    const elements = await this.collectCollection("/principals", params, limit);
    return elements.map(e => this.parseResponse(PrincipalSchema, e, "listPrincipals[]"));
  };
}
