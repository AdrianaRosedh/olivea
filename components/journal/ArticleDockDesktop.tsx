"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Share2, Link2, Plus, Minus, List, X } from "lucide-react";
import ArticleTOC, { type TocItem } from "@/components/journal/ArticleTOC";
import { ArticleShareGrid } from "./ArticleShareGrid";
import type { ArticleDockState } from "./useArticleDock";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ArticleDockDesktopProps {
  state: ArticleDockState;
  toc: TocItem[];
}

export function ArticleDockDesktop({
  state,
  toc,
}: ArticleDockDesktopProps) {
  const {
    labels,
    toast,
    sharePanelOpen,
    setSharePanelOpen,
    tocPanelOpen,
    setTocPanelOpen,
    hasToc,
    bumpFont,
    copy,
    shareLinks,
  } = state;

  return (
    <div className="hidden lg:block">
      <div
        className="fixed left-6 z-40"
        style={{ top: 240 }}
        aria-label="Article dock"
      >
        {/* Shared pill background (like top nav) */}
        <div
          className={cn(
            "flex flex-col gap-2 p-2",
            "rounded-full",
            "bg-white/24",
            "ring-1 ring-(--olivea-olive)/14",
            "backdrop-blur-md"
          )}
        >
          <button
            type="button"
            onClick={() => {
              setSharePanelOpen((v) => !v);
              setTocPanelOpen(false);
            }}
            className={cn(
              "h-12 w-12 rounded-full",
              "flex items-center justify-center",
              "text-(--olivea-olive)",
              "hover:bg-white/30 transition"
            )}
            aria-label={labels.share}
            title={labels.share}
          >
            <Share2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={copy}
            className={cn(
              "h-12 w-12 rounded-full",
              "flex items-center justify-center",
              "text-(--olivea-olive)",
              "hover:bg-white/30 transition"
            )}
            aria-label={labels.copy}
            title={labels.copy}
          >
            <Link2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => bumpFont(0.05)}
            className={cn(
              "h-12 w-12 rounded-full",
              "flex items-center justify-center",
              "text-(--olivea-olive)",
              "hover:bg-white/30 transition"
            )}
            aria-label={labels.bigger}
            title={labels.bigger}
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => bumpFont(-0.05)}
            className={cn(
              "h-12 w-12 rounded-full",
              "flex items-center justify-center",
              "text-(--olivea-olive)",
              "hover:bg-white/30 transition"
            )}
            aria-label={labels.smaller}
            title={labels.smaller}
          >
            <Minus className="h-5 w-5" />
          </button>

          {hasToc ? (
            <button
              type="button"
              onClick={() => {
                setTocPanelOpen((v) => !v);
                setSharePanelOpen(false);
              }}
              className={cn(
                "h-12 w-12 rounded-full",
                "flex items-center justify-center",
                "text-(--olivea-olive)",
                "hover:bg-white/30 transition"
              )}
              aria-label={labels.toc}
              title={labels.toc}
            >
              <List className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* click-away for desktop panels */}
      <AnimatePresence>
        {sharePanelOpen || tocPanelOpen ? (
          <motion.button
            type="button"
            className="fixed inset-0 z-30"
            style={{ background: "transparent" }}
            onClick={() => {
              setSharePanelOpen(false);
              setTocPanelOpen(false);
            }}
            aria-label={labels.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : null}
      </AnimatePresence>

      {/* Desktop Share panel */}
      <AnimatePresence>
        {sharePanelOpen ? (
          <motion.div
            className={cn(
              "fixed z-40 w-80",
              "rounded-3xl",
              "bg-white/24 ring-1 ring-(--olivea-olive)/12",
              "backdrop-blur-md",
              "p-4"
            )}
            style={{ left: 96, top: 220 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-85">
                {labels.shareTo}
              </div>

              <button
                type="button"
                onClick={() => setSharePanelOpen(false)}
                className={cn(
                  "h-10 w-10 rounded-full",
                  "inline-flex items-center justify-center",
                  "bg-white/22 ring-1 ring-(--olivea-olive)/12",
                  "text-(--olivea-olive) opacity-90",
                  "hover:bg-(--olivea-olive) hover:text-(--olivea-cream) hover:opacity-100",
                  "transition"
                )}
                aria-label={labels.close}
                title={labels.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">
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
                onDone={() => setSharePanelOpen(false)}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Desktop TOC panel */}
      <AnimatePresence>
        {hasToc && tocPanelOpen ? (
          <motion.div
            className={cn(
              "fixed z-40 w-80",
              "rounded-3xl",
              "bg-white/24 ring-1 ring-(--olivea-olive)/12",
              "backdrop-blur-md",
              "p-4"
            )}
            style={{ left: 96, top: 220 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-85">
                {labels.toc}
              </div>

              <button
                type="button"
                onClick={() => setTocPanelOpen(false)}
                className={cn(
                  "h-10 w-10 rounded-full",
                  "inline-flex items-center justify-center",
                  "bg-white/22 ring-1 ring-(--olivea-olive)/12",
                  "text-(--olivea-olive) opacity-90",
                  "hover:bg-(--olivea-olive) hover:text-(--olivea-cream) hover:opacity-100",
                  "transition"
                )}
                aria-label={labels.close}
                title={labels.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">
              <ArticleTOC items={toc} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* desktop toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fixed left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-[13px] bg-white/60 ring-1 ring-(--olivea-olive)/12 backdrop-blur-md text-(--olivea-olive)"
            style={{ pointerEvents: "none", top: 120 }}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
