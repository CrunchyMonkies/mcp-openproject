import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const PrincipalSchema = HalResourceSchema.extend({
  id: z.number().int(),
  name: z.string(),
});
export type Principal = z.infer<typeof PrincipalSchema>;
