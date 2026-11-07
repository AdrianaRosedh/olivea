"use client";

// A quiet close at the end of the house pages, before the footer: the house
// line, where you are with its local time and weather, and one last way to
// reserve. It ends the page like the last page of a journal instead of
// letting it simply run out, and the time and weather quietly help guests
// planning from another time zone.
//
// Wording comes from /admin → Interface text ("editorial.signoff.*"). The
// weather's source (MET Norway) is credited on the Legal page ("Data credits"),
// as its CC BY 4.0 licence allows; the sign-off itself stays clean.
// Time and weather render only after mount: both depend on "now", and
// rendering them on the server would show a stale minute and break hydration.

import { useEffect, useState } from "react";
import Reveal from "@/components/scroll/Reveal";
import RollText from "@/components/ui/RollText";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import { useUiText } from "@/lib/uiText/context";
import { SITE_TIMEZONE } from "@/lib/site";
import { describeWeather } from "@/lib/weather";
import type { Lang } from "@/lib/i18n";

/** How often the shown time refreshes. */
const CLOCK_TICK_MS = 30_000;

function useLocalTime(lang: Lang) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: SITE_TIMEZONE,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, [lang]);
  return time;
}

function useWeather(lang: Lang) {
  const [weather, setWeather] = useState<string | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/weather", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { ok: boolean; tempC?: number; symbol?: string }) => {
        if (d.ok && d.tempC != null) setWeather(describeWeather(d.tempC, d.symbol ?? "", lang));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [lang]);
  return weather;
}

export default function PageSignOff({ lang, house }: { lang: Lang; house: ReservationType }) {
  const { openReservationModal } = useReservation();
  const t = useUiText(lang);
  const time = useLocalTime(lang);
  const weather = useWeather(lang);
  const meta = [time, weather].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-[760px] pb-10 pt-24 text-center md:pb-16 md:pt-36">
      <Reveal preset="fade">
        <span aria-hidden="true" className="olivea-hairline mb-10" />
      </Reveal>

      <Reveal preset="up" delay={0.05}>
        <p className="olivea-display-italic" style={{ fontSize: "clamp(26px, 2.8vw, 40px)", lineHeight: 1.2 }}>
          {t("editorial.signoff.line")}
        </p>
      </Reveal>

      <Reveal preset="up" delay={0.12}>
        <div className="olivea-eyebrow mt-8">{t("editorial.signoff.place")}</div>
        {/* Reserved height so the line doesn't jump when the time arrives. */}
        <div className="mt-3 min-h-[1.5em] text-[13px] tracking-[0.08em] text-(--olivea-olive)">
          {meta.length > 0 && (
            <span>
              {t("editorial.signoff.localTime")} · {meta.join(" · ")}
            </span>
          )}
        </div>
      </Reveal>

      <Reveal preset="up" delay={0.2}>
        <button type="button" onClick={() => openReservationModal(house)} className="olivea-pill-button mt-10">
          <RollText>{t(`editorial.signoff.cta.${house}`)}</RollText>
        </button>
      </Reveal>
    </div>
  );
}
