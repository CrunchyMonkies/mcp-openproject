import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const TypeSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  color: z.string().optional(),
  position: z.number().optional(),
  isDefault: z.boolean().optional(),
  isMilestone: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Type = z.infer<typeof TypeSchema>;
