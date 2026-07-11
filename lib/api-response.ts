import { NextResponse } from "next/server";

/** Prevent caching of authenticated dashboard API responses. */
export function privateJson<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
