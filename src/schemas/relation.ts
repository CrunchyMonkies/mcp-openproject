import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const RelationSchema = HalResourceSchema.extend({
  id: z.number().int(),
  type: z.string(),
  name: z.string().optional(),
  reverseType: z.string().optional(),
  description: z.string().optional(),
  lag: z.number().optional(),
});
export type Relation = z.infer<typeof RelationSchema>;

export const CreateRelationInputSchema = z.object({
  fromId: z.number().int(),
  toId: z.number().int(),
  type: z.string(),
  description: z.string().optional(),
  lag: z.number().optional(),
});
export type CreateRelationInput = z.infer<typeof CreateRelationInputSchema>;
