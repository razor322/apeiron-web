import { z } from "zod";

// JPL CNEOS Close-Approach Data (cad.api) returns a columnar JSON: `fields` names
// the columns and `data` is an array of rows. Only the columns the adapter maps
// are required.
export const CadSchema = z.object({
  fields: z.array(z.string()),
  data: z.array(z.array(z.union([z.string(), z.number()]))),
  count: z.union([z.string(), z.number()]).optional(),
});

export type CadData = z.infer<typeof CadSchema>;
