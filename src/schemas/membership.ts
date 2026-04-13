import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const MembershipSchema = HalResourceSchema.extend({
  id: z.number().int(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Membership = z.infer<typeof MembershipSchema>;

export const CreateMembershipInputSchema = z.object({
  projectId: z.number().int(),
  principalId: z.number().int(),
  roleIds: z.array(z.number().int()),
});
export type CreateMembershipInput = z.infer<typeof CreateMembershipInputSchema>;

export const UpdateMembershipInputSchema = z.object({
  roleIds: z.array(z.number().int()),
});
export type UpdateMembershipInput = z.infer<typeof UpdateMembershipInputSchema>;
