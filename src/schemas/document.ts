import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const DocumentSchema = HalResourceSchema.extend({
  id: z.number().int(),
  title: z.string().optional(),
  description: z.union([
    z.object({ format: z.string().optional(), raw: z.string(), html: z.string().optional() }).catchall(z.unknown()),
    z.string(),
  ]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const UpdateDocumentInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentInputSchema>;
