"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { entrance } from "@/components/scroll/Reveal";
import { FAQ_TOPICS, type FaqTopic } from "@/lib/faqTopics";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type FAQItem = {
  q: string;
  a: React.ReactNode;
  /** Groups the question under a topic pill (see lib/faqTopics). */
  topic?: FaqTopic;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * With `initialCount`, only the first questions show and a quiet button opens
 * the rest in place: a page with 18–20 questions read as a wall. Every
 * question still reaches search engines and AI assistants through the page's
 * FAQ JSON-LD and server-rendered article, which list them all.
 */
export default function ModernFAQ({
  items,
  initialCount,
  moreLabel,
  lang = "es",
}: {
  items: FAQItem[];
  initialCount?: number;
  /** Button text for the rest, e.g. "Ver las 18 preguntas". */
  moreLabel?: string;
  lang?: "es" | "en";
}) {
  const reduce = usePrefersReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Topics, when the questions have them (two or more in use): a row of pills
  // shows one group at a time, so 18–20 questions read as four short lists.
  // Questions without a topic gather under "More" at the end.
  const used = FAQ_TOPICS.filter((t) => items.some((it) => it.topic === t.id));
  const untopiced = items.some((it) => !it.topic);
  const groups = [
    ...used.map((t) => ({ id: t.id as string, label: t.label[lang] })),
    ...(untopiced ? [{ id: "more", label: lang === "es" ? "Más" : "More" }] : []),
  ];
  const grouped = used.length >= 2;
  const [group, setGroup] = useState<string>(() => groups[0]?.id ?? "more");
  const inGroup = (it: FAQItem) => (it.topic ?? "more") === group;

  const limited = !grouped && !showAll && initialCount != null && items.length > initialCount + 1;
  const visible = grouped ? items.filter(inGroup) : limited ? items.slice(0, initialCount) : items;

  const chooseGroup = (id: string) => {
    setGroup(id);
    setOpenIndex(null);
  };

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className="space-y-4 mt-6">
      {grouped && (
        <div
          role="group"
          aria-label={lang === "es" ? "Temas" : "Topics"}
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          // A soft right edge says "there is more this way" on a phone; on
          // desktop the pills end well before it.
          style={{
            maskImage: "linear-gradient(to right, #000 calc(100% - 24px), transparent)",
            WebkitMaskImage: "linear-gradient(to right, #000 calc(100% - 24px), transparent)",
          }}
        >
          {groups.map((g) => {
            const active = g.id === group;
            const count = items.filter((it) => (it.topic ?? "more") === g.id).length;
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={active}
                onClick={() => chooseGroup(g.id)}
                className={[
                  "relative shrink-0 whitespace-nowrap rounded-full h-9 px-4",
                  "text-[11.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200",
                  active
                    ? "text-(--olivea-cream)"
                    : "text-(--olivea-olive) ring-1 ring-inset ring-(--olivea-olive)/22 hover:bg-(--olivea-olive)/8",
                ].join(" ")}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {active && (
                  <motion.span
                    layoutId="faq-topic-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-(--olivea-olive)"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative">
                  {g.label}
                  {/* Lighter weight, not faded: a faded count fell to 2:1. */}
                  <span className="ml-1.5 font-normal">{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {visible.map((item, i) => {
        const open = openIndex === i;

        return (
          <motion.div
            key={`${group}-${i}-${item.q}`}
            {...entrance(Math.min(i % 6, 5) * 0.04)}
            // The house's olive hairline, as on the chooser and the facts
            // band; a touch firmer while the answer is open.
            className={[
              "overflow-hidden rounded-[20px] border transition-colors duration-200",
              open
                ? "border-(--olivea-olive)/45 bg-white/35"
                : "border-(--olivea-olive)/22 bg-white/15 hover:border-(--olivea-olive)/40",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
              aria-expanded={open}
            >
              <span
                className="text-(--olivea-olive)"
                style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(18px, 1.5vw, 20px)", fontWeight: 600, lineHeight: 1.25 }}
              >
                {item.q}
              </span>

              <span
                aria-hidden="true"
                className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                  open
                    ? "border-(--olivea-olive) bg-(--olivea-olive) text-(--olivea-cream)"
                    : "border-(--olivea-olive)/30 text-(--olivea-olive)",
                ].join(" ")}
              >
                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="grid place-items-center"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <div className="px-5 pb-5 pt-0 md:px-6">
                    <div className="mb-4 h-px w-full bg-(--olivea-olive)/15" />
                    <div className="space-y-2 text-[15.5px] leading-relaxed text-(--olivea-ink)">
                      {item.a}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {limited && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 rounded-full border border-(--olivea-olive)/30 px-5 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-(--olivea-olive) hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
          >
            {moreLabel ?? `+ ${items.length - visible.length}`}
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}