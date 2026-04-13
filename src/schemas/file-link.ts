import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const FileLinkSchema = HalResourceSchema.extend({
  id: z.number().int(),
  originData: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    createdAt: z.string().optional(),
    lastModifiedAt: z.string().optional(),
  }).catchall(z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type FileLink = z.infer<typeof FileLinkSchema>;

export const CreateFileLinkInputSchema = z.object({
  storageUrl: z.string(),
  originId: z.string(),
  originName: z.string(),
  originMimeType: z.string().optional(),
});
export type CreateFileLinkInput = z.infer<typeof CreateFileLinkInputSchema>;
