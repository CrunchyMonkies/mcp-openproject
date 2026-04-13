import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const RevisionSchema = HalResourceSchema.extend({
  id: z.number().int(),
  identifier: z.string().optional(),
  message: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  createdAt: z.string().optional(),
});
export type Revision = z.infer<typeof RevisionSchema>;
