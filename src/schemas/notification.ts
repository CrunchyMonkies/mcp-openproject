import { z } from "zod";
import { HalResourceSchema } from "./hal.js";

export const NotificationSchema = HalResourceSchema.extend({
  id: z.number().int(),
  subject: z.string().optional(),
  reason: z.string().optional(),
  readIAN: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;
