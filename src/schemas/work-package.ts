import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const WorkPackageSchema = HalResourceSchema.extend({
  id: z.number().int(),
  subject: z.string(),
  lockVersion: z.number().int(),
  description: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  derivedStartDate: z.string().nullable().optional(),
  derivedDueDate: z.string().nullable().optional(),
  estimatedTime: z.string().nullable().optional(),
  spentTime: z.string().nullable().optional(),
  percentageDone: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type WorkPackage = z.infer<typeof WorkPackageSchema>;

export const CreateWorkPackageInputSchema = z.object({
  subject: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.string().optional(),
  percentageDone: z.number().optional(),
});
export type CreateWorkPackageInput = z.infer<typeof CreateWorkPackageInputSchema>;

export const UpdateWorkPackageInputSchema = z.object({
  subject: z.string().optional(),
  description: z.string().optional(),
  statusName: z.string().optional(),
  assigneeRef: z.string().optional(),
  priorityName: z.string().optional(),
  typeName: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.string().optional(),
  percentageDone: z.number().optional(),
});
export type UpdateWorkPackageInput = z.infer<typeof UpdateWorkPackageInputSchema>;
