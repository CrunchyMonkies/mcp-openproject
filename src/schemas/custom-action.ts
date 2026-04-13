import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const CustomActionSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string().optional(),
  description: z.string().optional(),
});
export type CustomAction = z.infer<typeof CustomActionSchema>;
