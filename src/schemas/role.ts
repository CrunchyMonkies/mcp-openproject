import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const RoleSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  position: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Role = z.infer<typeof RoleSchema>;
