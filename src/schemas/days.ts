import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const DaySchema = HalResourceSchema.extend({
  date: z.string(),
  name: z.string().optional(),
  working: z.boolean().optional(),
});
export type Day = z.infer<typeof DaySchema>;

export const WeekDaySchema = HalResourceSchema.extend({
  day: z.number().int(),
  name: z.string().optional(),
  working: z.boolean().optional(),
});
export type WeekDay = z.infer<typeof WeekDaySchema>;

export const NonWorkingDaySchema = HalResourceSchema.extend({
  id: z.number().int().optional(),
  date: z.string(),
  name: z.string().optional(),
});
export type NonWorkingDay = z.infer<typeof NonWorkingDaySchema>;
