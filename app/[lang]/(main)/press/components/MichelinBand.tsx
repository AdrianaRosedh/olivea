// The press page opens with Olivea's MICHELIN recognition, the strongest
// signal on the page; it used to start with whatever item was newest.

import Image from "next/image";
import { MICHELIN } from "@/lib/michelin";
import type { Lang } from "../pressTypes";

export default function MichelinBand({ lang }: { lang: Lang }) {
  const es = lang === "es";
  const link =
    "inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-(--olivea-olive) underline-offset-4 hover:underline";
  return (
    <section
      aria-label={es ? "Reconocimiento MICHELIN" : "MICHELIN recognition"}
      className="mt-6 sm:mt-10 rounded-3xl bg-[#e7eae1] ring-1 ring-(--olivea-olive)/12 px-6 py-7 sm:px-10 sm:py-9 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-3">
        <Image src="/images/press/awards/michelin.svg" alt="" width={34} height={34} />
        <Image src="/images/press/awards/michelin-green-star.svg" alt="" width={34} height={34} />
        <span className="text-[11px] uppercase tracking-[0.26em] text-(--olivea-olive)/80">
          {es ? "Guía MICHELIN" : "MICHELIN Guide"}
        </span>
      </div>

      <p
        className="mt-4 text-(--olivea-olive)"
        style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 600, lineHeight: 1.12 }}
      >
        {es ? "Una Estrella MICHELIN · Estrella Verde MICHELIN" : "One MICHELIN Star · MICHELIN Green Star"}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="border-l border-(--olivea-olive)/20 pl-4">
          <p className="text-(--olivea-ink)" style={{ fontSize: "17px", lineHeight: 1.5 }}>
            Olivea Farm To Table ·{" "}
            <span className="whitespace-nowrap">{es ? "2025 y 2026" : "2025 and 2026"}</span>
          </p>
          <a href={MICHELIN.restaurant} target="_blank" rel="noopener noreferrer" className={`mt-1.5 ${link}`}>
            {es ? "Ver en la Guía MICHELIN" : "View in the MICHELIN Guide"} ↗
          </a>
        </div>
        <div className="border-l border-(--olivea-olive)/20 pl-4">
          <p className="text-(--olivea-ink)" style={{ fontSize: "17px", lineHeight: 1.5 }}>
            {es ? "Casa Olivea · en la Guía MICHELIN (hoteles)" : "Casa Olivea · in the MICHELIN Guide (hotels)"}
          </p>
          <a href={MICHELIN.hotel} target="_blank" rel="noopener noreferrer" className={`mt-1.5 ${link}`}>
            {es ? "Ver en la Guía MICHELIN" : "View in the MICHELIN Guide"} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
