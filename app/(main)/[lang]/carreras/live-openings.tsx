"use client";

import { useEffect, useState } from "react";
import { getLiveJobOpenings, type JobOpening } from "@/lib/supabase/careers-actions";
import type { Lang } from "@/lib/i18n";

export default function LiveOpenings({ lang }: { lang: Lang }) {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveJobOpenings()
      .then(setOpenings)
      .catch(() => setOpenings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-white/20 ring-1 ring-black/8 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (openings.length === 0) return null;

  const L = lang;

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] uppercase tracking-[0.22em] text-(--olivea-olive)/85">
        {L === "es" ? "Posiciones abiertas" : "Open positions"}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {openings.map((o) => (
          <a
            key={o.id}
            href="#aplicar"
            className="group rounded-[22px] bg-white/40 ring-1 ring-black/8 p-5 hover:bg-white/60 hover:ring-black/12 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-[15px] font-semibold text-(--olivea-ink) group-hover:text-(--olivea-olive) transition-colors">
                  {L === "es" ? o.titleEs : o.titleEn || o.titleEs}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-(--olivea-ink)/60">
                  <span>{o.area}</span>
                  <span>·</span>
                  <span className="capitalize">{o.type.replace("-", " ")}</span>
                  <span>·</span>
                  <span>{o.location}</span>
                </div>
              </div>
              <span className="mt-1 text-[11px] tracking-wider uppercase text-(--olivea-olive)/70 opacity-0 group-hover:opacity-100 transition-opacity">
                {L === "es" ? "Aplicar →" : "Apply →"}
              </span>
            </div>

            {(L === "es" ? o.descriptionEs : o.descriptionEn || o.descriptionEs) && (
              <p className="mt-3 text-[14px] leading-[1.7] text-(--olivea-ink)/70 line-clamp-2">
                {L === "es" ? o.descriptionEs : o.descriptionEn || o.descriptionEs}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
