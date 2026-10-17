import { z } from "zod";

// Count query result: TAP returns [{"n": 40350}].
export const ExoplanetCountSchema = z.array(z.object({ n: z.coerce.number().int() }));
