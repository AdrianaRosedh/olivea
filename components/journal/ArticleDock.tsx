// components/journal/ArticleDock.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lang } from "@/app/(main)/[lang]/dictionaries";
import ArticleTOC, { type TocItem } from "@/components/journal/ArticleTOC";
import { Share2, Link2, Plus, Minus, List, X } from "lucide-react";
import { shortPathForArticle } from "@/lib/journal/shortcode";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

function enc(s: string) {
  return encodeURIComponent(s);
}

function openPopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function ArticleDock({
  lang,
  canonicalPath,
  toc,
}: {
  lang: Lang;
  canonicalPath: string;
  toc: TocItem[];
}) {
  const hasToc = toc.length > 0;

  const labels = useMemo(
    () => ({
      share: tt(lang, "Compartir", "Share"),
      copy: tt(lang, "Copiar link", "Copy link"),
      copied: tt(lang, "Copiado", "Copied"),
      bigger: tt(lang, "Aumentar texto", "Increase text"),
      smaller: tt(lang, "Reducir texto", "Decrease text"),
      toc: tt(lang, "Secciones", "Sections"),
      close: tt(lang, "Cerrar", "Close"),
      done: tt(lang, "Listo", "Done"),
      clipboardBlocked: tt(
        lang,
        "Copia manual: selecciona y copia el link.",
        "Manual copy: select and copy the link."
      ),
      shareTo: tt(lang, "Compartir en", "Share to"),
      threads: "Threads",
      facebook: "Facebook",
      x: "X",
      linkedin: "LinkedIn",
    }),
    [lang]
  );

  const url = useMemo(() => {
    if (typeof window === "undefined") return canonicalPath;
    return new URL(canonicalPath, window.location.origin).toString();
  }, [canonicalPath]);

  const shortUrl = useMemo(() => {
    if (typeof window === "undefined") return url;

    // canonicalPath: "/es/journal/<slug>"
    const parts = canonicalPath.split("/").filter(Boolean);
    const l = parts[0] || "es";
    const slug = parts[2] || "";
    if (!slug) return url;

    const shortPath = shortPathForArticle(l, slug);
    return new URL(shortPath, window.location.origin).toString();
  }, [canonicalPath, url]);

  const shareText = useMemo(() => {
    return tt(lang, "Olivea — Journal", "Olivea — Journal");
  }, [lang]);

  const shareLinks = useMemo(() => {
    const threads = `https://www.threads.net/intent/post?text=${enc(shareText)}&url=${enc(
      url
    )}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    const x = `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`;
    const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    return { threads, facebook, x, linkedin };
  }, [shareText, url]);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  /**
   * Font scale that *always* works:
   * set var on <html>, <body>, and <main> if present.
   */
  const setScaleVar = useCallback((value: number) => {
    const v = String(value);
    document.documentElement.style.setProperty("--journal-font-scale", v);
    document.body.style.setProperty("--journal-font-scale", v);

    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
      main.style.setProperty("--journal-font-scale", v);
    }
  }, []);

  // Ensure default exists
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--journal-font-scale")
      .trim();
    if (!raw) setScaleVar(1);
  }, [setScaleVar]);

  const bumpFont = useCallback(
    (delta: number) => {
      const root = document.documentElement;
      const raw = getComputedStyle(root).getPropertyValue("--journal-font-scale").trim();
      const current = raw ? Number(raw) : 1;
      const safe = Number.isFinite(current) ? current : 1;

      const next = Math.min(1.25, Math.max(0.9, safe + delta));
      setScaleVar(next);
      showToast(`${next.toFixed(2)}×`);
    },
    [setScaleVar, showToast]
  );

  const copy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard");
      await navigator.clipboard.writeText(shortUrl);
      showToast(labels.copied);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = shortUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast(labels.copied);
      } catch {
        showToast(labels.clipboardBlocked);
      }
    }
  }, [labels.clipboardBlocked, labels.copied, shortUrl, showToast]);

  const tryNativeShare = useCallback(async () => {
    try {
      const nav = navigator as ShareCapableNavigator;
      if (nav.share) {
        await nav.share({ url, text: shareText });
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [shareText, url]);

  /* =========================
     share (mobile sheet + desktop panel)
     ========================= */
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);

  const openShare = useCallback(async () => {
    const ok = await tryNativeShare();
    if (!ok) setShareOpen(true);
  }, [tryNativeShare]);

  useEffect(() => {
    if (!shareOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shareOpen]);

  /* =========================
     toc sheet (mobile) + toc panel (desktop)
     ========================= */
  const [tocSheetOpen, setTocSheetOpen] = useState(false);
  const [tocPanelOpen, setTocPanelOpen] = useState(false);

  useEffect(() => {
    if (!tocSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [tocSheetOpen]);

  /* =========================
     mobile bar hide/show
     ========================= */
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    lastY.current = y;

    if (shareOpen || tocSheetOpen) return;

    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;
    const HIDE_DELTA = 14;
    const SHOW_DELTA = -2;

    if (delta > HIDE_DELTA) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < SHOW_DELTA) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
    }
  });

  const TOP_OFFSET_CLASS = "top-14";
  const BAR_HEIGHT_SPACER = "h-14";

  const iconBtn = cn(
    "h-10 w-10 rounded-full",
    "bg-white/22 ring-1 ring-(--olivea-olive)/12",
    "text-(--olivea-olive) opacity-85",
    "hover:bg-white/30 hover:opacity-100 transition",
    "inline-flex items-center justify-center"
  );

  const ShareGrid = ({ onDone }: { onDone?: () => void }) => {
    const btn = cn(
      "rounded-2xl px-4 py-3 text-left",
      "bg-white/30 ring-1 ring-(--olivea-olive)/14 hover:bg-white/38 transition",
      "text-(--olivea-olive)"
    );

    const iconWrap = cn(
      "h-9 w-9 rounded-full bg-white/35 ring-1 ring-(--olivea-olive)/12",
      "inline-flex items-center justify-center"
    );

    return (
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={btn} onClick={() => openPopup(shareLinks.threads)}>
          <div className="flex items-center gap-3">
            <span className={iconWrap}>@</span>
            <div className="text-[13px] font-medium">{labels.threads}</div>
          </div>
        </button>

        <button type="button" className={btn} onClick={() => openPopup(shareLinks.facebook)}>
          <div className="flex items-center gap-3">
            <span className={iconWrap}>f</span>
            <div className="text-[13px] font-medium">{labels.facebook}</div>
          </div>
        </button>

        <button type="button" className={btn} onClick={() => openPopup(shareLinks.x)}>
          <div className="flex items-center gap-3">
            <span className={iconWrap}>𝕏</span>
            <div className="text-[13px] font-medium">{labels.x}</div>
          </div>
        </button>

        <button type="button" className={btn} onClick={() => openPopup(shareLinks.linkedin)}>
          <div className="flex items-center gap-3">
            <span className={iconWrap}>in</span>
            <div className="text-[13px] font-medium">{labels.linkedin}</div>
          </div>
        </button>

        <button
          type="button"
          className={cn(btn, "col-span-2")}
          onClick={async () => {
            await copy();
            onDone?.();
          }}
        >
          <div className="flex items-center gap-3">
            <span className={iconWrap}>
              <Link2 className="h-4 w-4" />
            </span>
            <div className="text-[13px] font-medium">{labels.copy}</div>
          </div>
        </button>
      </div>
    );
  };

  /* =========================
     Mobile: second navbar (icons only) + sheets
     ========================= */
  const mobileBar = (
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
                onClick={openShare}
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
                    <ShareGrid onDone={() => setShareOpen(false)} />
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

  /* =========================
     Desktop: pill dock (like top nav) + panels
     ========================= */
  const desktopDock = (
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
              <ShareGrid onDone={() => setSharePanelOpen(false)} />
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

  return (
    <>
      {mobileBar}
      {desktopDock}
    </>
  );
}
