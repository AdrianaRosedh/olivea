// app/(main)/[lang]/press/PressMediaGallery.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Lang, PressManifest, PressMediaItem } from "./pressTypes";
import { tt } from "./lib/pressText";

function downloadFile(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function downloadMany(urls: string[]) {
  for (let i = 0; i < urls.length; i++) {
    downloadFile(urls[i]);
    // small delay to reduce browser blocking
    await new Promise((r) => setTimeout(r, 250));
  }
}

export default function PressMediaGallery({
  lang,
  manifest,
}: {
  lang: Lang;
  manifest: PressManifest;
}) {
  // ✅ Make media reference stable (fixes exhaustive-deps warning)
  const media = useMemo<PressMediaItem[]>(
    () => manifest.media ?? [],
    [manifest.media]
  );

  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const categories = useMemo((): string[] => {
    const s = new Set<string>();
    for (const it of media) s.add(it.category);
    return ["all", ...Array.from(s)];
  }, [media]);

  const shown = useMemo((): PressMediaItem[] => {
    if (category === "all") return media;
    return media.filter((m) => m.category === category);
  }, [media, category]);

  const selectedUrls = useMemo((): string[] => {
    const urls: string[] = [];
    for (const it of media) {
      if (!selected[it.id]) continue;
      urls.push(it.web);
      if (it.hires) urls.push(it.hires);
    }
    return urls;
  }, [media, selected]);

  const chipBase = cn(
    "px-3 py-1.5 rounded-full text-[12px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/18 text-(--olivea-clay) opacity-95",
    "hover:bg-white/26 hover:text-(--olivea-olive) hover:opacity-100"
  );

  const chipActive = cn(
    "px-3 py-1.5 rounded-full text-[12px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/26",
    "bg-(--olivea-olive)/12 text-(--olivea-olive) opacity-100"
  );

  return (
    <section id="media" className="mt-12 sm:mt-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-75">
            {tt(lang, "Media Library", "Media Library")}
          </div>
          <h2
            className="mt-2 text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {tt(lang, "Fotografías & Recursos", "Photography & Assets")}
          </h2>
          <p className="mt-2 text-[14px] text-(--olivea-clay) opacity-95 max-w-[78ch]">
            {tt(
              lang,
              "Descarga individual (web o hi-res), con créditos y captions listos para publicar.",
              "Download individually (web or hi-res) with credits and publish-ready captions."
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={category === c ? chipActive : chipBase}
              onClick={() => setCategory(c)}
            >
              {c === "all" ? tt(lang, "Todo", "All") : c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-[13px] text-(--olivea-olive) opacity-80">
          {tt(lang, "Seleccionados", "Selected")}:{" "}
          {Object.values(selected).filter(Boolean).length}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSelected({})}
            className={cn(
              "rounded-2xl px-4 py-2.5",
              "bg-white/28 ring-1 ring-(--olivea-olive)/14",
              "text-(--olivea-olive) hover:bg-white/40 transition"
            )}
          >
            {tt(lang, "Limpiar", "Clear")}
          </button>

          <button
            type="button"
            disabled={selectedUrls.length === 0}
            onClick={() => downloadMany(selectedUrls)}
            className={cn(
              "rounded-2xl px-4 py-2.5",
              selectedUrls.length === 0
                ? "bg-(--olivea-olive)/10 text-(--olivea-olive)/60 ring-1 ring-(--olivea-olive)/10"
                : "bg-(--olivea-olive) text-(--olivea-cream) ring-1 ring-black/10 hover:brightness-[1.03]",
              "transition"
            )}
          >
            {tt(lang, "Descargar seleccionados", "Download selected")}
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white/25 ring-1 ring-(--olivea-olive)/12 p-8 text-(--olivea-clay) opacity-90">
          {tt(
            lang,
            "Aún no hay recursos en la galería. Agrega elementos en public/press/manifest.json",
            "No media yet. Add items in public/press/manifest.json"
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {shown.map((it) => (
            <MediaCard
              key={it.id}
              lang={lang}
              it={it}
              checked={!!selected[it.id]}
              onToggle={() =>
                setSelected((prev) => ({ ...prev, [it.id]: !prev[it.id] }))
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MediaCard({
  lang,
  it,
  checked,
  onToggle,
}: {
  lang: Lang;
  it: PressMediaItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const title = it.title?.[lang] ?? it.id;
  const caption = it.caption?.[lang];

  return (
    <div className="rounded-3xl overflow-hidden bg-white/40 ring-1 ring-(--olivea-olive)/12 shadow-[0_12px_35px_rgba(40,60,35,0.10)]">
      <div className="relative aspect-4/3 bg-(--olivea-cream)/40">
        <Image
          src={it.web}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "absolute top-3 left-3 rounded-full px-3 py-1.5 text-[12px]",
            "backdrop-blur-md ring-1",
            checked
              ? "bg-(--olivea-olive)/25 ring-(--olivea-olive)/25 text-(--olivea-olive)"
              : "bg-white/45 ring-(--olivea-olive)/14 text-(--olivea-olive)"
          )}
        >
          {checked ? "✓ " : ""}
          {tt(lang, "Añadir", "Add")}
        </button>
      </div>

      <div className="p-5">
        <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-70">
          {it.category}
        </div>

        <div className="mt-2 text-[16px] font-medium text-(--olivea-olive)">
          {title}
        </div>

        {caption ? (
          <div className="mt-2 text-[13px] text-(--olivea-clay) opacity-90">
            {caption}
          </div>
        ) : null}

        {it.credit ? (
          <div className="mt-2 text-[12px] text-(--olivea-olive) opacity-70">
            {it.credit}
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <a
            href={it.web}
            download
            className={cn(
              "flex-1 inline-flex items-center justify-center",
              "rounded-2xl px-3 py-2.5",
              "bg-white/28 ring-1 ring-(--olivea-olive)/14",
              "text-(--olivea-olive) hover:bg-white/40 transition"
            )}
          >
            Web
          </a>

          {it.hires ? (
            <a
              href={it.hires}
              download
              className={cn(
                "flex-1 inline-flex items-center justify-center",
                "rounded-2xl px-3 py-2.5",
                "bg-(--olivea-olive) text-(--olivea-cream)",
                "ring-1 ring-black/10 hover:brightness-[1.03] transition"
              )}
            >
              Hi-Res
            </a>
          ) : (
            <div
              className={cn(
                "flex-1 inline-flex items-center justify-center",
                "rounded-2xl px-3 py-2.5",
                "bg-(--olivea-olive)/10 text-(--olivea-olive)/60",
                "ring-1 ring-(--olivea-olive)/10"
              )}
            >
              Hi-Res
            </div>
          )}
        </div>
      </div>
    </div>
  );
}