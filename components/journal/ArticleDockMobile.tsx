"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Share2, Link2, Plus, Minus, List, X } from "lucide-react";
import ArticleTOC, { type TocItem } from "@/components/journal/ArticleTOC";
import { ArticleShareGrid } from "./ArticleShareGrid";
import type { ArticleDockState } from "./useArticleDock";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TOP_OFFSET_CLASS = "top-14";
const BAR_HEIGHT_SPACER = "h-14";

interface ArticleDockMobileProps {
  state: ArticleDockState;
  toc: TocItem[];
}

export function ArticleDockMobile({
  state,
  toc,
}: ArticleDockMobileProps) {
  const {
    labels,
    toast,
    barHidden,
    shareOpen,
    setShareOpen,
    tocSheetOpen,
    setTocSheetOpen,
    hasToc,
    bumpFont,
    copy,
    shareLinks,
    tryNativeShare,
  } = state;

  const iconBtn = cn(
    "h-10 w-10 rounded-full",
    "bg-white/22 ring-1 ring-(--olivea-olive)/12",
    "text-(--olivea-olive) opacity-85",
    "hover:bg-white/30 hover:opacity-100 transition",
    "inline-flex items-center justify-center"
  );

  return (
    <>
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      <motion.div
        className={cn("md:hidden fixed left-0 right-0 z-50", TOP_OFFSET_CLASS)}
        style={{ pointerEvents: "none" }}
        animate={barHidden ? "hidden" : "show"}
        variants={{
          show: { y: 0, opacity: 1 },
          hidden: { y: -44, opacity: 0 },
        }}
        transition={{ duration: barHidden ? 0.34 : 0.18, ease: EASE }}
      >
        <div className="px-3 pt-2" style={{ pointerEvents: "auto" }}>
          <div className="rounded-2xl bg-white/24 ring-1 ring-(--olivea-olive)/10 backdrop-blur-md">
            <div className="px-2 py-2 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  const shared = await tryNativeShare();
                  if (!shared) setShareOpen(true);
                }}
                className={iconBtn}
                aria-label={labels.share}
                title={labels.share}
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={copy}
                className={iconBtn}
                aria-label={labels.copy}
                title={labels.copy}
              >
                <Link2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => bumpFont(0.05)}
                className={iconBtn}
                aria-label={labels.bigger}
                title={labels.bigger}
              >
                <Plus className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => bumpFont(-0.05)}
                className={iconBtn}
                aria-label={labels.smaller}
                title={labels.smaller}
              >
                <Minus className="h-5 w-5" />
              </button>

              {hasToc ? (
                <button
                  type="button"
                  onClick={() => setTocSheetOpen(true)}
                  className={iconBtn}
                  aria-label={labels.toc}
                  title={labels.toc}
                >
                  <List className="h-5 w-5" />
                </button>
              ) : (
                <div className="h-10 w-10" aria-hidden />
              )}
            </div>
          </div>
        </div>

        {/* SHARE SHEET */}
        <AnimatePresence>
          {shareOpen ? (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-50 bg-black/25"
                style={{ pointerEvents: "auto" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShareOpen(false)}
                aria-label={labels.close}
              />
              <motion.div
                className={cn(
                  "fixed z-50 left-0 right-0 bottom-0",
                  "rounded-t-3xl bg-white/75 ring-1 ring-(--olivea-olive)/14",
                  "backdrop-blur-md"
                )}
                style={{ pointerEvents: "auto" }}
                initial={{ y: 420, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 420, opacity: 0 }}
                transition={{ duration: 0.26, ease: EASE }}
                role="dialog"
                aria-modal="true"
              >
                <div className="px-4 pt-3 pb-4">
                  <div className="mx-auto h-1 w-10 rounded-full bg-(--olivea-olive)/15" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-85">
                      {labels.shareTo}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShareOpen(false)}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/40 ring-1 ring-(--olivea-olive)/14 text-(--olivea-olive) hover:bg-white/55 transition"
                      aria-label={labels.close}
                      title={labels.close}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 pb-[max(12px,env(safe-area-inset-bottom))]">
                    <ArticleShareGrid
                      labels={{
                        threads: labels.threads,
                        facebook: labels.facebook,
                        x: labels.x,
                        linkedin: labels.linkedin,
                        copy: labels.copy,
                      }}
                      shareLinks={shareLinks}
                      onCopy={copy}
                      onDone={() => setShareOpen(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShareOpen(false)}
                      className="mt-4 w-full rounded-2xl px-4 py-3 text-[13px] bg-(--olivea-olive) text-(--olivea-cream) ring-1 ring-black/10 hover:brightness-105 transition"
                    >
                      {labels.done}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        {/* TOC SHEET */}
        <AnimatePresence>
          {tocSheetOpen ? (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-50 bg-black/25"
                style={{ pointerEvents: "auto" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTocSheetOpen(false)}
                aria-label={labels.close}
              />
              <motion.div
                className={cn(
                  "fixed z-50 left-0 right-0 bottom-0",
                  "rounded-t-3xl bg-white/75 ring-1 ring-(--olivea-olive)/14",
                  "backdrop-blur-md"
                )}
                style={{ pointerEvents: "auto" }}
                initial={{ y: 420, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 420, opacity: 0 }}
                transition={{ duration: 0.26, ease: EASE }}
                role="dialog"
                aria-modal="true"
              >
                <div className="px-4 pt-3 pb-4">
                  <div className="mx-auto h-1 w-10 rounded-full bg-(--olivea-olive)/15" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-85">
                      {labels.toc}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTocSheetOpen(false)}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/40 ring-1 ring-(--olivea-olive)/14 text-(--olivea-olive) hover:bg-white/55 transition"
                      aria-label={labels.close}
                      title={labels.close}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 pb-[max(12px,env(safe-area-inset-bottom))]">
                    <ArticleTOC items={toc} />
                    <button
                      type="button"
                      onClick={() => setTocSheetOpen(false)}
                      className="mt-4 w-full rounded-2xl px-4 py-3 text-[13px] bg-(--olivea-olive) text-(--olivea-cream) ring-1 ring-black/10 hover:brightness-105 transition"
                    >
                      {labels.done}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        {/* toast */}
        <AnimatePresence>
          {toast ? (
            <motion.div
              className="fixed left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-[13px] bg-white/60 ring-1 ring-(--olivea-olive)/12 backdrop-blur-md text-(--olivea-olive)"
              style={{
                pointerEvents: "none",
                top: "calc(env(safe-area-inset-top) + 112px)",
              }}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              {toast}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
