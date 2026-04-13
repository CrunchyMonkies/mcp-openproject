import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const VersionSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
  description: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.string().optional(),
  sharing: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Version = z.infer<typeof VersionSchema>;

export const CreateVersionInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  sharing: z.string().optional(),
  projectId: z.number().int(),
});
export type CreateVersionInput = z.infer<typeof CreateVersionInputSchema>;

export const UpdateVersionInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  sharing: z.string().optional(),
});
export type UpdateVersionInput = z.infer<typeof UpdateVersionInputSchema>;
