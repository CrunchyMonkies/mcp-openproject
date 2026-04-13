import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const CollectionSchema = z.object({
  _type: z.literal("Collection").optional(),
  total: z.number().optional(),
  count: z.number().optional(),
  pageSize: z.number().optional(),
  offset: z.number().optional(),
  _links: z.record(z.string(), z.unknown()).optional(),
  _embedded: z.object({
    elements: z.array(HalResourceSchema),
  }).catchall(z.unknown()).optional(),
}).catchall(z.unknown());

export type Collection = z.infer<typeof CollectionSchema>;
