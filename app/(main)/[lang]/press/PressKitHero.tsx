// app/(main)/[lang]/press/PressKitHero.tsx
"use client";

import { cn } from "@/lib/utils";
import type { Lang, PressManifest } from "./pressTypes";
import { tt } from "./lib/pressText";

function copyToClipboard(text: string) {
  if (typeof navigator === "undefined") return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

export default function PressKitHero({
  lang,
  manifest,
}: {
  lang: Lang;
  manifest: PressManifest;
}) {
  const c = manifest.copy[lang];

  return (
    <section id="presskit" className="mt-6 sm:mt-10">
      <div className="rounded-[28px] border border-(--olivea-olive)/12 bg-white/55 shadow-[0_18px_55px_rgba(40,60,35,0.12)] overflow-hidden">
        <div className="p-7 sm:p-10">
          <div className="text-[12px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-80">
            {c.headline}
          </div>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[78ch]">
              <h1
                className="text-[30px] sm:text-[36px] md:text-[40px] font-semibold tracking-[-0.03em] text-(--olivea-olive)"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {tt(lang, "Press Kit", "Press Kit")}
              </h1>

              <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-(--olivea-clay) opacity-95">
                {c.subhead}
              </p>

              <div className="mt-4 text-[12px] text-(--olivea-olive) opacity-80">
                <span className="uppercase tracking-[0.30em]">
                  {tt(lang, "Actualizado", "Updated")}
                </span>
                <span className="ml-2">{manifest.updatedAt}</span>
                <span className="mx-2">•</span>
                <span className="uppercase tracking-[0.30em]">
                  {tt(lang, "Versión", "Version")}
                </span>
                <span className="ml-2">{manifest.version}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <a
                href={manifest.downloads.fullKit}
                download
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "rounded-2xl px-5 py-3",
                  "bg-(--olivea-olive) text-(--olivea-cream)",
                  "ring-1 ring-black/10 transition hover:brightness-[1.03]"
                )}
              >
                <span className="text-sm font-medium">
                  {tt(lang, "Descargar kit completo", "Download full kit")}
                </span>
                <span className="opacity-90">↘</span>
              </a>

              <a
                href={manifest.downloads.logos}
                download
                className={cn(
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-5 py-3",
                  "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                  "text-(--olivea-olive) hover:bg-white/40 transition"
                )}
              >
                {tt(lang, "Logos", "Logos")}
              </a>

              <a
                href={manifest.downloads.factsheet}
                download
                className={cn(
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-5 py-3",
                  "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                  "text-(--olivea-olive) hover:bg-white/40 transition"
                )}
              >
                {tt(lang, "Fact Sheet", "Fact Sheet")}
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/35 ring-1 ring-(--olivea-olive)/12 p-5">
              <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-75">
                {tt(lang, "Boilerplate (30 palabras)", "Boilerplate (30 words)")}
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-(--olivea-clay) opacity-95">
                {c.boilerplate30}
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(c.boilerplate30)}
                className="mt-3 text-[12px] text-(--olivea-olive) underline underline-offset-4 opacity-80 hover:opacity-100"
              >
                {tt(lang, "Copiar", "Copy")}
              </button>
            </div>

            <div className="rounded-2xl bg-white/35 ring-1 ring-(--olivea-olive)/12 p-5">
              <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-75">
                {tt(lang, "Boilerplate (80 palabras)", "Boilerplate (80 words)")}
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-(--olivea-clay) opacity-95">
                {c.boilerplate80}
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(c.boilerplate80)}
                className="mt-3 text-[12px] text-(--olivea-olive) underline underline-offset-4 opacity-80 hover:opacity-100"
              >
                {tt(lang, "Copiar", "Copy")}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/28 ring-1 ring-(--olivea-olive)/10 p-5">
            <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-75">
              {c.usageTitle}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-(--olivea-clay) opacity-95 max-w-[90ch]">
              {c.usageBody}
            </p>

            <div className="mt-3 text-[13px] text-(--olivea-olive) opacity-90">
              <a className="underline underline-offset-4" href={`mailto:${manifest.contactEmail}`}>
                {manifest.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}