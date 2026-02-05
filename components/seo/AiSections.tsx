// components/seo/AiSections.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function AISection(props: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-5xl px-6 py-14", props.className)}>
      <div className="rounded-3xl bg-white/40 backdrop-blur ring-1 ring-black/5 shadow-[0_18px_50px_rgba(40,60,35,0.10)] overflow-hidden">
        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] tracking-[0.34em] uppercase text-(--olivea-ink)/55">
            Olivea
          </p>

          <h2
            className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-(--olivea-ink)"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {props.title}
          </h2>

          <p className="mt-4 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-ink)/75 max-w-[78ch]">
            {props.body}
          </p>

          {props.ctaHref ? (
            <div className="mt-6">
              <a
                href={props.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-white/55 backdrop-blur px-4 py-2 text-sm text-(--olivea-ink)/85 ring-1 ring-black/5 hover:bg-white/70 transition"
              >
                {props.ctaLabel ?? "Learn more"}
                <span className="text-(--olivea-olive)/70">→</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export type FAQItem = { q: string; a: string };

function FaqRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-black/10 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-7 py-5 sm:px-10 flex items-center justify-between gap-4 text-left"
      >
        <span className="text-[15px] sm:text-[16px] font-medium text-(--olivea-ink)">
          {item.q}
        </span>
        <span className="text-(--olivea-ink)/45 text-xl leading-none">
          {open ? "–" : "+"}
        </span>
      </button>

      <div
        className={cn(
          "px-7 sm:px-10 pb-6 -mt-1 text-[14px] sm:text-[15px] leading-relaxed text-(--olivea-ink)/70 max-w-[95ch]",
          open ? "block" : "hidden"
        )}
      >
        {item.a}
      </div>
    </div>
  );
}

export function FAQSection(props: {
  title: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-5xl px-6 pb-16", props.className)}>
      <div className="rounded-3xl bg-white/40 backdrop-blur ring-1 ring-black/5 shadow-[0_18px_50px_rgba(40,60,35,0.10)] overflow-hidden">
        <div className="px-7 pt-8 pb-5 sm:px-10 sm:pt-10">
          <p className="text-[11px] tracking-[0.34em] uppercase text-(--olivea-ink)/55">
            Información
          </p>
          <h3
            className="mt-3 text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-(--olivea-ink)"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {props.title}
          </h3>
          {props.subtitle ? (
            <p className="mt-3 text-[14px] sm:text-[15px] text-(--olivea-ink)/70 max-w-[78ch]">
              {props.subtitle}
            </p>
          ) : null}
        </div>

        <div className="pb-2">
          {props.items.map((it, idx) => (
            <FaqRow key={`${idx}-${it.q}`} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}
