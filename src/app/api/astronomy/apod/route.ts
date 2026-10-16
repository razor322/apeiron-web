import { NextResponse } from "next/server";

import { fetchApod } from "@/lib/astronomy/providers/nasa-apod";

export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await fetchApod();
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      { error: "provider_unavailable" },
      { status: 503 },
    );
  }
}
