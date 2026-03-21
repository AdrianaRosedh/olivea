import { NextResponse } from "next/server";

const DRIVE_DIRECT =
  "https://drive.google.com/uc?export=download&id=1QyRiSUbnxoOzqNcR5ou6VvZA6yFSu0V0";

export function GET() {
  return NextResponse.redirect(DRIVE_DIRECT);
}