import { NextResponse } from "next/server";

const DRIVE_DIRECT =
  "https://drive.google.com/file/d/1QyRiSUbnxoOzqNcR5ou6VvZA6yFSu0V0/view?usp=sharing";

export function GET() {
  return NextResponse.redirect(DRIVE_DIRECT);
}