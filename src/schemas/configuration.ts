import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const ConfigurationSchema = HalResourceSchema.extend({
  maximumAttachmentFileSize: z.number().optional(),
  perPageOptions: z.array(z.number()).optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
  startOfWeek: z.number().optional(),
  activeFeatureFlags: z.array(z.string()).optional(),
});
export type Configuration = z.infer<typeof ConfigurationSchema>;

export const RootSchema = HalResourceSchema.extend({
  instanceName: z.string().optional(),
  coreVersion: z.string().optional(),
});
export type Root = z.infer<typeof RootSchema>;
