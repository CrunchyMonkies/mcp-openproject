import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RELATION_TYPES, type OpenProjectClient } from "../client.js";
import { OpenProjectError } from "../errors.js";
import { linkTitle, truncate } from "../helpers.js";
import type { Relation } from "../types.js";

function formatRelations(relations: Relation[], wpId: number): string {
  const lines = [`Work package #${wpId}`];
  if (relations.length === 0) {
    lines.push("No relations returned.");
    return lines.join("\n");
  }

  lines.push("ID    Type        From           To             Lag");
  lines.push("----  ----------  -------------  -------------  ----");
  for (const r of relations) {
    const id = String(r.id || "?").padEnd(4);
    const type = truncate(String(r.type || "-"), 10).padEnd(10);
    const from = truncate(linkTitle(r, "from", "-"), 13).padEnd(13);
    const to = truncate(linkTitle(r, "to", "-"), 13).padEnd(13);
    const lag = String(r.lag ?? "-");
    lines.push(`${id}  ${type}  ${from}  ${to}  ${lag}`);
  }
  return lines.join("\n");
}

export function registerRelationTools(
  server: McpServer,
  getClient: () => OpenProjectClient,
): void {
  server.tool(
    "list_relations",
    "List relations for a work package.",
    {
      id: z.number().int().describe("Work package ID."),
      limit: z.number().int().min(1).max(500).optional().describe("Max relations to fetch (default: 100)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const relations = await client.listWorkPackageRelations(params.id, params.limit ?? 100);
        return { content: [{ type: "text", text: formatRelations(relations, params.id) }] };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "create_relation",
    "Create a relation between two work packages (e.g., blocks, follows, relates).",
    {
      fromId: z.number().int().describe("Source work package ID."),
      toId: z.number().int().describe("Target work package ID."),
      type: z.enum([...RELATION_TYPES] as [string, ...string[]]).describe("Relation type."),
      description: z.string().optional().describe("Relation description."),
      lag: z.number().int().optional().describe("Lag value (typically in days)."),
    },
    async (params) => {
      try {
        const client = getClient();
        const relation = await client.createRelation(
          params.fromId,
          params.toId,
          params.type,
          params.description,
          params.lag,
        );
        return {
          content: [{
            type: "text",
            text: `Created relation #${relation.id}: #${params.fromId} ${relation.type} #${params.toId}.`,
          }],
        };
      } catch (err) {
        const message = err instanceof OpenProjectError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
