import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const UserSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string().optional(),
  login: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  admin: z.boolean().optional(),
  status: z.string().optional(),
  language: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserInputSchema = z.object({
  login: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().optional(),
  admin: z.boolean().optional(),
  language: z.string().optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = z.object({
  login: z.string().optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  admin: z.boolean().optional(),
  language: z.string().optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
