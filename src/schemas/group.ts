import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const GroupSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Group = z.infer<typeof GroupSchema>;

export const CreateGroupInputSchema = z.object({
  name: z.string(),
  memberIds: z.array(z.number().int()).optional(),
});
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>;

export const UpdateGroupInputSchema = z.object({
  name: z.string().optional(),
  memberIds: z.array(z.number().int()).optional(),
});
export type UpdateGroupInput = z.infer<typeof UpdateGroupInputSchema>;
