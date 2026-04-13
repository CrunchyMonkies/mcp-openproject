import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const TimeEntrySchema = HalResourceSchema.extend({
  id: z.number().int(),
  hours: z.string().optional(),
  comment: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  spentOn: z.string().optional(),
  ongoing: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type TimeEntry = z.infer<typeof TimeEntrySchema>;

export const CreateTimeEntryInputSchema = z.object({
  hours: z.string(),
  comment: z.string().optional(),
  spentOn: z.string(),
  workPackageId: z.number().int(),
  activityId: z.number().int().optional(),
  projectId: z.number().int().optional(),
});
export type CreateTimeEntryInput = z.infer<typeof CreateTimeEntryInputSchema>;

export const UpdateTimeEntryInputSchema = z.object({
  hours: z.string().optional(),
  comment: z.string().optional(),
  spentOn: z.string().optional(),
  activityId: z.number().int().optional(),
});
export type UpdateTimeEntryInput = z.infer<typeof UpdateTimeEntryInputSchema>;
