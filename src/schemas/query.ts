import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const QuerySchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  starred: z.boolean().optional(),
  public: z.boolean().optional(),
  sums: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Query = z.infer<typeof QuerySchema>;

export const CreateQueryInputSchema = z.object({
  name: z.string(),
  projectId: z.number().int().optional(),
  public: z.boolean().optional(),
  starred: z.boolean().optional(),
  filters: z.array(z.record(z.string(), z.unknown())).optional(),
  sortBy: z.array(z.array(z.string())).optional(),
  columns: z.array(z.string()).optional(),
});
export type CreateQueryInput = z.infer<typeof CreateQueryInputSchema>;
