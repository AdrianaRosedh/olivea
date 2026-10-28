// The press page opens with Olivea's MICHELIN recognition, the strongest
// signal on the page; it used to start with whatever item was newest.

import Image from "next/image";
import { MICHELIN } from "@/lib/michelin";
import type { Lang } from "../pressTypes";
import type { PressContent } from "@/lib/content/types";

export default function MichelinBand({
  lang,
  band,
}: {
  lang: Lang;
  /** Its lines, edited in /admin → Press. Nothing shows without a heading. */
  band?: PressContent["michelin_band"];
}) {
  const es = lang === "es";
  const t = (b?: { en?: string; es?: string }) => (b?.[lang] || b?.es || "").trim();
  if (!t(band?.heading)) return null;
  const link =
    "inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-(--olivea-olive) underline-offset-4 hover:underline";
  return (
    <section
      aria-label={es ? "Reconocimiento MICHELIN" : "MICHELIN recognition"}
      className="mt-6 sm:mt-10 rounded-3xl bg-[#e7eae1] ring-1 ring-(--olivea-olive)/12 px-6 py-7 sm:px-10 sm:py-9 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-3">
        <Image src="/images/press/awards/michelin.svg" alt="" width={34} height={37} />
        <Image src="/images/press/awards/michelin-green-star.svg" alt="" width={34} height={32} />
        <span className="text-[11px] uppercase tracking-[0.26em] text-(--olivea-olive)/80">
          {t(band?.guideLabel)}
        </span>
      </div>

      <p
        className="mt-4 text-(--olivea-olive)"
        style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 600, lineHeight: 1.12 }}
      >
        {t(band?.heading)}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="border-l border-(--olivea-olive)/20 pl-4">
          <p className="text-(--olivea-ink)" style={{ fontSize: "17px", lineHeight: 1.5 }}>
            {t(band?.restaurant)}
          </p>
          <a href={MICHELIN.restaurant} target="_blank" rel="noopener noreferrer" className={`mt-1.5 ${link}`}>
            {t(band?.linkLabel)} ↗
          </a>
        </div>
        <div className="border-l border-(--olivea-olive)/20 pl-4">
          <p className="text-(--olivea-ink)" style={{ fontSize: "17px", lineHeight: 1.5 }}>
            {t(band?.hotel)}
          </p>
          <a href={MICHELIN.hotel} target="_blank" rel="noopener noreferrer" className={`mt-1.5 ${link}`}>
            {t(band?.linkLabel)} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
