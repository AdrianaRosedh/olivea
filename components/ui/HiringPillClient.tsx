"use client";

// components/ui/HiringPillClient.tsx
// ─────────────────────────────────────────────────────────────────────
// The dismissible "we're hiring" pill shown in the bottom-left corner of
// public pages. Data (whether to show, role, count) is decided server-side
// in HiringPill.tsx; this only handles presentation + per-session dismissal.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, X } from "lucide-react";
import {
  subscribeConsentSettled,
  getConsentSettled,
  getConsentSettledServer,
} from "@/components/legal/consentFlag";

const DISMISS_KEY = "olivea:hiring-pill-dismissed";

export default function HiringPillClient({
  lang,
  count,
  role,
  href,
}: {
  lang: "es" | "en";
  count: number;
  role: string | null;
  href: string;
}) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  // Don't nag on the careers page itself — they're already there.
  const onCareersPage = pathname?.includes("/carreras") ?? false;

  // The cookie banner occupies this same bottom-left corner. Wait for the
  // visitor to answer it rather than stacking two notices on them; published
  // by CookieConsent, which is the only thing that knows both whether a choice
  // is stored and whether the panel is open right now.
  const consentSettled = useSyncExternalStore(
    subscribeConsentSettled,
    getConsentSettled,
    getConsentSettledServer
  );

  // Reveal after mount (skip if dismissed this session), with a short delay so
  // it settles in after the page rather than competing with first paint.
  //
  // The delay is measured from the moment consent is settled, not from mount,
  // so accepting cookies doesn't snap the pill into the space the banner just
  // vacated — it arrives the same unhurried way it does for a returning
  // visitor.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (onCareersPage) return;
    if (!consentSettled) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    const t = window.setTimeout(() => setShow(true), 1200);
    return () => window.clearTimeout(t);
  }, [onCareersPage, consentSettled]);

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

  const heading = lang === "es" ? "Estamos contratando" : "We're hiring";
  const detail =
    count === 1 && role
      ? role
      : count === 0
        ? lang === "es" ? "Únete a nuestro equipo" : "Join our team"
        : lang === "es"
          ? `${count} vacantes abiertas`
          : `${count} open roles`;

  return (
    <AnimatePresence>
      {/* consentSettled is checked here too, not just in the effect above:
          the footer's Cookies link can reopen the banner at any time, and the
          pill should step back out of the corner when it does. */}
      {show && consentSettled && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          /* z-210 clears the fixed footer (z-200). At z-40 the footer painted
             over the pill even where they only partly overlapped. */
          className="fixed left-4 z-210 max-w-[min(20rem,calc(100vw-2rem))]"
          style={{
            // Clear the fixed footer, which is 48-52px of the bottom of the
            // viewport on desktop and absent on mobile. Footer publishes its
            // measured height as --footer-h for exactly this; the pill was
            // pinned at 1rem and sat 47px inside the footer band.
            // Fallback 0 because there is no footer on mobile, where a
            // non-zero default would strand the pill above the fold.
            bottom:
              "calc(var(--footer-h, 0px) + 1rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Link
            href={href}
            className="group flex items-center gap-3 rounded-full py-2.5 pl-3 pr-4
              bg-[var(--olivea-olive)] text-[var(--olivea-cream)]
              shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] ring-1 ring-white/10
              hover:bg-[var(--olivea-clay)] transition-colors duration-300"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12">
              <Briefcase className="h-4 w-4" />
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
