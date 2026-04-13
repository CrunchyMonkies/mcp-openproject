import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const PrioritySchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  position: z.number().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  color: z.string().optional(),
});
export type Priority = z.infer<typeof PrioritySchema>;
