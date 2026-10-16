export type ProviderEvent =
  | "fetch"
  | "ok"
  | "error"
  | "rate_limited"
  | "cache_hit"
  | "cache_miss";

export type ProviderLogFields = {
  provider: string;
  event: ProviderEvent;
  ms?: number;
  status?: number;
  errorClass?: string;
};

// Structured, dependency-free provider logging. One line per event so logs stay
// greppable. Route handlers must not surface these strings to clients.
export function logProvider(fields: ProviderLogFields): void {
  const parts = [`[provider=${fields.provider}]`, `event=${fields.event}`];
  if (fields.ms !== undefined) parts.push(`ms=${fields.ms}`);
  if (fields.status !== undefined) parts.push(`status=${fields.status}`);
  if (fields.errorClass) parts.push(`error=${fields.errorClass}`);
  const line = parts.join(" ");
  if (fields.event === "error") console.error(line);
  else if (fields.event === "rate_limited") console.warn(line);
  else console.info(line);
}

export function timeProvider(): () => number {
  const started = Date.now();
  return () => Date.now() - started;
}
