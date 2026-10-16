import { z } from "zod";

// Tolerant of the current documented APOD JSON shapes: the NASA api.nasa.gov
// gateway and the science.nasa.gov WordPress APOD endpoint differ in optional
// fields, so unknown keys are stripped and only the shared core is required.
export const ApodSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.enum(["image", "video", "other"]).catch("other"),
  url: z.string().url(),
  hdurl: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  copyright: z.string().optional(),
  service_version: z.string().optional(),
});

export type ApodData = z.infer<typeof ApodSchema>;
