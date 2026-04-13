import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpenProjectClient } from "../client/index.js";
import { OpenProjectError } from "../errors.js";

export function registerConfigurationTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "get_configuration",
    "Get the OpenProject instance configuration.",
    {},
    async () => {
      try {
        const client = getClient();
        const config = await client.getConfiguration();
        return { content: [{ type: "text", text: JSON.stringify(config, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "get_server_info",
    "Get OpenProject server information and API root.",
    {},
    async () => {
      try {
        const client = getClient();
        const info = await client.getServerInfo();
        return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
