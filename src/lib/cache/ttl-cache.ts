import type { AstronomySnapshot } from "@/lib/astronomy/models";

type Entry = { data: unknown; storedAt: number };

const store = new Map<string, Entry>();

export function clearCache(key?: string): void {
  if (key === undefined) store.clear();
  else store.delete(key);
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<AstronomySnapshot<T>> {
  const now = Date.now();
  const entry = store.get(key);

  if (entry && now - entry.storedAt < ttlMs) {
    return snapshot<T>(entry.data as T, entry.storedAt);
  }

  try {
    const data = await fetcher();
    store.set(key, { data, storedAt: Date.now() });
    return snapshot(data, Date.now());
  } catch (err) {
    if (entry) {
      return { ...snapshot<T>(entry.data as T, entry.storedAt), stale: true };
    }
    throw err;
  }
}

// ponytail: fetcher resolves raw T only (matches brief's Cache interface: key, ttl,
// fetcher). provider/sourceUrl are placeholders; widen to accept provenance metadata
// when an adapter actually needs to surface it.
function snapshot<T>(data: T, at: number): AstronomySnapshot<T> {
  return {
    data,
    provider: "cache",
    sourceUrl: "",
    retrievedAt: new Date(at).toISOString(),
    stale: false,
  };
}
