// lib/events.ts
// Dinners and other dated events (Mesa Invitada…), edited in /admin → Events
// and stored in public.events. A series page shows its next upcoming event;
// when none is upcoming it shows the latest one as past, so a page about a
// dinner that already happened never keeps selling it or telling Google it is
// still scheduled.

import type { Bilingual } from "@/lib/content/types";

export interface OliveaEvent {
  id: string;
  series: string;
  /** "YYYY-MM-DD", the day of the event in Baja California. */
  eventDate: string;
  poster?: string;
  shareImage?: string;
  bookingUrl?: string;
  dinnerPrice?: number;
  stayPrice?: number;
  /** Every line of the page, in both languages (see the admin editor). */
  copy: Record<string, Bilingual>;
}

type EventRow = {
  id: string;
  series: string;
  event_date: string;
  poster: string | null;
  share_image: string | null;
  booking_url: string | null;
  dinner_price: number | null;
  stay_price: number | null;
  copy: Record<string, Bilingual> | null;
};

const fromRow = (r: EventRow): OliveaEvent => ({
  id: r.id,
  series: r.series,
  eventDate: String(r.event_date).slice(0, 10),
  poster: r.poster ?? undefined,
  shareImage: r.share_image ?? undefined,
  bookingUrl: r.booking_url ?? undefined,
  dinnerPrice: r.dinner_price ?? undefined,
  stayPrice: r.stay_price ?? undefined,
  copy: r.copy ?? {},
});

/** Today in Baja California, "YYYY-MM-DD": an event stays upcoming through
 *  its own day there, whatever time zone the server runs in. */
export function todayInBaja(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Tijuana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

async function loadSeries(series: string): Promise<OliveaEvent[]> {
  try {
    const { isSupabaseConfigured } = await import("@/lib/supabase/config");
    if (isSupabaseConfigured) {
      const { selectRows } = await import("@/lib/supabase/client");
      const rows = await selectRows<EventRow>("events", {
        role: "anon",
        query: `series=eq.${encodeURIComponent(series)}&order=event_date.asc`,
        revalidate: 60,
      });
      if (rows.length) return rows.map(fromRow);
    }
  } catch {
    // Supabase unavailable — fall through to the snapshot.
  }
  const { default: fallback } = await import("@/lib/content/data/events");
  return fallback.filter((e) => e.series === series);
}

/** The event a series page shows, and whether it has already happened. */
export async function currentEvent(series: string): Promise<{ event: OliveaEvent; past: boolean } | null> {
  const events = await loadSeries(series);
  if (!events.length) return null;
  const today = todayInBaja();
  const upcoming = events.find((e) => e.eventDate >= today);
  if (upcoming) return { event: upcoming, past: false };
  return { event: events[events.length - 1], past: true };
}
