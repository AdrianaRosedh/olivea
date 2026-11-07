// Current weather in Valle de Guadalupe for the page sign-off.
//
// Fetched here rather than in the browser so the page's CSP stays as it is
// and visitors never call a third party directly.
//
// Cached on the server, not only at the CDN: the route is static and
// regenerated every 15 minutes, so query strings (e.g. ?x=<random> to dodge
// the CDN) are ignored and the upstream sees at most a few requests an hour
// however the endpoint is called. Any failure returns { ok: false } and the
// sign-off simply leaves the weather out.

import { SITE_GEO, SITE_TIMEZONE } from "@/lib/site";

export const runtime = "nodejs";
/** Regenerate at most every 15 minutes; requests in between get the saved answer. */
export const dynamic = "force-static";
export const revalidate = 900;

const URL_ =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${SITE_GEO.latitude}&longitude=${SITE_GEO.longitude}` +
  `&current=temperature_2m,weather_code&timezone=${encodeURIComponent(SITE_TIMEZONE)}`;

export async function GET() {
  try {
    const res = await fetch(URL_, { signal: AbortSignal.timeout(4000), next: { revalidate } });
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const t = j.current?.temperature_2m;
    const code = j.current?.weather_code;
    if (typeof t !== "number" || typeof code !== "number") throw new Error("shape");
    return Response.json({ ok: true, tempC: Math.round(t), code });
  } catch {
    return Response.json({ ok: false });
  }
}
