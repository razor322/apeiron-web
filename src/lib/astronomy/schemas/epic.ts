import { z } from "zod";

// NASA EPIC (Earth Polychromatic Imaging Camera) natural-colour collection. The
// list endpoint returns an array of images with a date and an image id; the
// archive image URL is derived from the date and id.
export const EpicImageSchema = z.object({
  identifier: z.string().optional(),
  image: z.string(),
  date: z.string(),
  caption: z.string().optional(),
});

export const EpicImagesSchema = z.array(EpicImageSchema);

export type EpicImage = z.infer<typeof EpicImageSchema>;
