import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const ProjectSchema = HalResourceSchema.extend({
  id: z.number().int(),
  identifier: z.string(),
  name: z.string(),
  description: z.object({ format: z.string(), raw: z.string(), html: z.string() }).catchall(z.unknown()).optional(),
  public: z.boolean().optional(),
  active: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectInputSchema = z.object({
  name: z.string(),
  identifier: z.string().optional(),
  description: z.object({ raw: z.string() }).optional(),
  public: z.boolean().optional(),
  parent: z.string().optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = z.object({
  name: z.string().optional(),
  description: z.object({ raw: z.string() }).optional(),
  public: z.boolean().optional(),
  active: z.boolean().optional(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
