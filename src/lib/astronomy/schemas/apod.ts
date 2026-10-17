import { z } from "zod";

// science.nasa.gov SMD APOD plugin feed (/wp-json/wp/v2/apod-basic). One item.
// The response is an array; the provider reads the first valid item. Fields are
// HTML-bearing strings, sanitized by the provider. hdurl is a direct image URL
// for image days and an empty string for video days, so empty is allowed.
export const ApodSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.enum(["image", "video", "other"]).catch("other"),
  url: z.string().url(),
  hdurl: z.union([z.string().url(), z.literal("")]).optional(),
  credit: z.string().optional(),
  copyright: z.string().optional(),
  alt: z.string().optional(),
});

export type ApodData = z.infer<typeof ApodSchema>;
