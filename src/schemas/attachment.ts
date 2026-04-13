import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const AttachmentSchema = HalResourceSchema.extend({
  id: z.number().int(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  contentType: z.string().optional(),
  description: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  digest: z.object({ algorithm: z.string(), hash: z.string() }).optional(),
  createdAt: z.string().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;
