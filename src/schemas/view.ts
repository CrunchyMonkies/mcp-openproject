import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const ViewSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type View = z.infer<typeof ViewSchema>;

export const CreateViewInputSchema = z.object({
  name: z.string().optional(),
  queryId: z.number().int(),
});
export type CreateViewInput = z.infer<typeof CreateViewInputSchema>;
