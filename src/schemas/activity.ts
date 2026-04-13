import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const ActivitySchema = HalResourceSchema.extend({
  id: z.number().int(),
  comment: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  details: z.array(z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown())).optional(),
  version: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;
