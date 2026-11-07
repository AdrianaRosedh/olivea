// Current weather in Valle de Guadalupe for the page sign-off.
//
// Source: MET Norway's Locationforecast (the Norwegian Meteorological
// Institute). Free, no key, and its data is open (CC BY 4.0 / NLOD), which
// allows commercial use with credit — the sign-off shows "MET Norway" next to
// the weather. Their terms (api.met.no/doc/TermsOfService) ask for:
//  - an identifying User-Agent with a way to reach the site's owner;
//  - coordinates with at most 4 decimals;
//  - not repeating a request before its `Expires` time (about 30 minutes).
//
// Fetched here rather than in the browser so the page's CSP stays as it is
// and visitors never call a third party directly. The route is static and
// regenerated at most every 30 minutes, so query strings (e.g. ?x=<random> to
// dodge the CDN) are ignored and MET sees a couple of requests an hour however
// the endpoint is called. Any failure returns { ok: false } and the sign-off
// simply leaves the weather out.

import { SITE, SITE_GEO } from "@/lib/site";

export const runtime = "nodejs";
/** Matches MET's own refresh/Expires cadence (~30 min). */
export const dynamic = "force-static";
export const revalidate = 1800;

/** MET asks for at most 4 decimals. */
const coord = (n: number) => n.toFixed(4);

const URL_ =
  "https://api.met.no/weatherapi/locationforecast/2.0/compact" +
  `?lat=${coord(SITE_GEO.latitude)}&lon=${coord(SITE_GEO.longitude)}`;

/** MET requires an identifying User-Agent with contact details: the site and
 *  its public contact page (never a personal address). */
const USER_AGENT = `OliveaFarmToTable/1.0 ${SITE.canonicalBaseUrl}/en/contact`;

type MetCompact = {
  properties?: {
    timeseries?: Array<{
      data?: {
        instant?: { details?: { air_temperature?: number } };
        next_1_hours?: { summary?: { symbol_code?: string } };
        next_6_hours?: { summary?: { symbol_code?: string } };
      };
    }>;
  };
};

export async function GET() {
  try {
    const res = await fetch(URL_, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate },
    });
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as MetCompact;
    const now = j.properties?.timeseries?.[0]?.data;
    const t = now?.instant?.details?.air_temperature;
    const symbol = now?.next_1_hours?.summary?.symbol_code ?? now?.next_6_hours?.summary?.symbol_code ?? "";
    if (typeof t !== "number") throw new Error("shape");
    return Response.json({ ok: true, tempC: Math.round(t), symbol });
  } catch {
    return Response.json({ ok: false });
  }
}
