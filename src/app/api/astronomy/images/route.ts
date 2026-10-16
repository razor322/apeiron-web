import { NextResponse } from "next/server";

import { searchNasaImage } from "@/lib/astronomy/providers/nasa-images";

// Server-only. The query is forwarded to the NASA Image Library; provider error
// details are never surfaced to the client.
export async function GET(request: Request): Promise<NextResponse> {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }
  try {
    return NextResponse.json(await searchNasaImage(q));
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429") || message.includes("403")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ error: "provider_unavailable" }, { status: 503 });
  }
}
