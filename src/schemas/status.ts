import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const StatusSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  isClosed: z.boolean().optional(),
  position: z.number().optional(),
  isDefault: z.boolean().optional(),
  isReadonly: z.boolean().optional(),
  color: z.string().optional(),
});
export type Status = z.infer<typeof StatusSchema>;
