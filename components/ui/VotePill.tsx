"use client";

// components/ui/VotePill.tsx
// ─────────────────────────────────────────────────────────────────────
// A dedicated, dismissible corner pill promoting the MexBest 2026 Reader's
// Choice vote. Deliberately its OWN surface, not the shared SiteBanner slot:
// the banner shows one notice at a time, so putting the vote there displaced
// whatever else the house wanted to announce. This runs alongside the banner
// and popup instead of competing for their slot.
//
// It shares the hiring pill's bottom-left corner and its hard-won positioning
// (consent gate, footer/dock clearance, z-310). To avoid two pills stacking in
// the same corner, the hiring pill steps aside while this campaign is live —
// both decisions read isVoteCampaignLive() in lib/mexbest, so they cannot
// drift. Presentation + per-session dismissal only; the campaign window lives
// in lib/mexbest.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Award, X } from "lucide-react";
import {
  subscribeConsentSettled,
  getConsentSettled,
  getConsentSettledServer,
} from "@/components/legal/consentFlag";
import { isVoteCampaignLive, isVotePath, MEXBEST_CAMPAIGN } from "@/lib/mexbest";

const DISMISS_KEY = "olivea:vote-pill-dismissed";

export default function VotePill({ lang }: { lang: "es" | "en" }) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  // Not on the vote page itself — they're already there.
  const onVotePage = isVotePath(pathname);
  // Evaluated on the client so a page cached before the end date still hides
  // the pill once the window has closed.
  const [live, setLive] = useState(false);

  // The cookie banner owns this same bottom-left corner; wait for the visitor
  // to answer it before arriving, exactly as the hiring pill does.
  const consentSettled = useSyncExternalStore(
    subscribeConsentSettled,
    getConsentSettled,
    getConsentSettledServer
  );

  useEffect(() => {
    setLive(isVoteCampaignLive());
  }, []);

  // Defer to the site banner: while the banner is on screen it already carries
  // the vote, so the pill stands down — one prompt at a time, banner first. The
  // banner renders `[data-olivea-banner-root]` when visible; watch for it so
  // the pill also reappears if the visitor dismisses the banner, and shows on
  // pages the banner excludes (the locale roots). The pill's own reveal delay
  // below sits past the banner's ~2.2–2.6s arm delay, so a banner that is
  // coming suppresses the pill before it ever flashes.
  const [bannerPresent, setBannerPresent] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () =>
      setBannerPresent(!!document.querySelector("[data-olivea-banner-root]"));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  // Reveal after mount, a beat after the page settles rather than at first
  // paint — measured from consent being settled so accepting cookies doesn't
  // snap it into the space the banner just vacated.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (onVotePage || !live || !consentSettled || bannerPresent) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* private mode — treat as not dismissed */
    }
    // Longer than the banner's arm delay (2200ms desktop / 2600ms mobile): if a
    // banner is coming, `bannerPresent` flips true and this effect re-runs to
    // hide the pill before the timer fires, so the two never both appear.
    const t = window.setTimeout(() => setShow(true), 3000);
    return () => window.clearTimeout(t);
  }, [onVotePage, live, consentSettled, bannerPresent]);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — just hide for now */
    }
    setShow(false);
  };

  const heading = lang === "es" ? "Vota por Olivea" : "Vote for Olivea";
  const detail =
    lang === "es"
      ? "Reader's Choice · MexBest 2026"
      : "Reader's Choice · MexBest 2026";

  return (
    <AnimatePresence>
      {show && consentSettled && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          // Same stacking + corner as the hiring pill: z-310 clears the fixed
          // footer (z-200) and the mobile dock's z-300 stacking context.
          className="fixed left-4 z-310 max-w-[min(20rem,calc(100vw-2rem))]"
          style={{
            // Clear whichever bar owns the bottom of the viewport — the fixed
            // footer on desktop, the section dock on mobile. Both anchor to
            // bottom:0, so this is max(), not a sum. Copied from the hiring
            // pill, which measured and solved this.
            bottom:
              "calc(max(var(--footer-h, 0px), var(--mobile-dock-h, 0px)) + 1rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Link
            href={MEXBEST_CAMPAIGN.votePath(lang)}
            className="group flex items-center gap-3 rounded-full py-2.5 pl-3 pr-4
              bg-[var(--olivea-olive)] text-[var(--olivea-cream)]
              shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] ring-1 ring-white/10
              hover:bg-[var(--olivea-clay)] transition-colors duration-300"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12">
              <Award className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--olivea-olive)]" />
              </span>
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[13px] font-semibold tracking-wide">{heading}</span>
              <span className="block truncate text-[11px] text-[var(--olivea-cream)]/75">{detail}</span>
            </span>
            <span
              aria-hidden
              className="ml-1 text-[var(--olivea-cream)]/60 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label={lang === "es" ? "Cerrar" : "Dismiss"}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center
              rounded-full bg-white text-[var(--olivea-ink)] shadow-md ring-1 ring-black/5
              hover:bg-[var(--olivea-cream)] transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
