import { z } from "zod";

export const HalLinkSchema = z.object({
  href: z.string(),
  title: z.string().optional(),
  method: z.string().optional(),
}).catchall(z.unknown());

export const HalLinksSchema = z.record(z.string(), HalLinkSchema.optional());

export const HalResourceSchema = z.object({
  _type: z.string().optional(),
  _links: HalLinksSchema.optional(),
  _embedded: z.record(z.string(), z.unknown()).optional(),
}).catchall(z.unknown());

export type HalLink = z.infer<typeof HalLinkSchema>;
export type HalLinks = z.infer<typeof HalLinksSchema>;
export type HalResource = z.infer<typeof HalResourceSchema>;
