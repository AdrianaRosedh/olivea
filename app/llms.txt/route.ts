// app/llms.txt/route.ts
//
// Served from the CMS rather than checked in as a file. A build-time script
// would not have solved the drift it was meant to solve: editing hours at
// /admin/hours does not trigger a deploy, so a generated file would go stale
// the moment someone changed a service — which is exactly how the café's
// hours ended up four hours wrong in the version this replaces.

import { buildLlmsTxt } from "@/lib/llms/document";

export const revalidate = 3600;

export async function GET() {
  const body = await buildLlmsTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
