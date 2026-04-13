import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const NewsSchema = HalResourceSchema.extend({
  id: z.number().int(),
  title: z.string(),
  summary: z.string().optional(),
  description: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type News = z.infer<typeof NewsSchema>;

export const CreateNewsInputSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  projectId: z.number().int(),
});
export type CreateNewsInput = z.infer<typeof CreateNewsInputSchema>;

export const UpdateNewsInputSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
});
export type UpdateNewsInput = z.infer<typeof UpdateNewsInputSchema>;
