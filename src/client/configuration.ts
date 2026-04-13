import {
  ConfigurationSchema,
  RootSchema,
  type Configuration,
  type Root,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerConfigurationMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getConfiguration = async function(this: OpenProjectClient): Promise<Configuration> {
    const data = await this.request("GET", "/configuration");
    return this.parseResponse(ConfigurationSchema, data, "getConfiguration");
  };

  Client.prototype.getServerInfo = async function(this: OpenProjectClient): Promise<Root> {
    // Root endpoint is at /api/v3 itself — path "" maps to "/"
    const data = await this.request("GET", "/");
    return this.parseResponse(RootSchema, data, "getServerInfo");
  };
}
