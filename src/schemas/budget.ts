import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const BudgetSchema = HalResourceSchema.extend({
  id: z.number().int(),
  subject: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Budget = z.infer<typeof BudgetSchema>;
