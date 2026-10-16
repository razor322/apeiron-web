import { z } from "zod";

// NASA Image and Video Library search response. Only the fields the adapter maps
// are required; unknown keys are stripped.
export const NasaImagesSchema = z.object({
  collection: z.object({
    items: z.array(
      z.object({
        data: z.array(
          z.object({
            nasa_id: z.string(),
            title: z.string(),
            description: z.string().optional(),
            date_created: z.string().optional(),
          }),
        ),
        links: z.array(z.object({ href: z.string().url() })).optional(),
      }),
    ),
  }),
});

export type NasaImagesData = z.infer<typeof NasaImagesSchema>;
