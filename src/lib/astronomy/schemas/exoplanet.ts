import { z } from "zod";

// NASA Exoplanet Archive TAP: rows from the `ps` (planetary systems) table,
// returned as a JSON array. Only the columns the adapter maps are required; TAP
// returns numbers as strings or numbers depending on the column, so both are
// accepted and coerced where used.
export const ExoplanetRowSchema = z.object({
  pl_name: z.string(),
  hostname: z.string().optional(),
  disc_year: z.coerce.number().int().optional(),
  disc_facility: z.string().optional(),
  discoverymethod: z.string().optional(),
  pl_orbper: z.coerce.number().optional(),
  pl_rade: z.coerce.number().optional(),
});

export const ExoplanetRowsSchema = z.array(ExoplanetRowSchema);

export type ExoplanetRow = z.infer<typeof ExoplanetRowSchema>;
