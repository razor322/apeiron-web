import { NextResponse } from "next/server";

import { fetchApod, RateLimitError } from "@/lib/astronomy/providers/nasa-apod";

export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await fetchApod();
    return NextResponse.json(snapshot);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ error: "provider_unavailable" }, { status: 503 });
  }
}
