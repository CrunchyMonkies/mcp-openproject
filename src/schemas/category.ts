import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const CategorySchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;
