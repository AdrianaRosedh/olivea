"use client";

// ─────────────────────────────────────────────────────────────────────
// Cookie consent — GDPR-grade, on-brand, and quiet.
//
// Analytics default to DENIED via Google Consent Mode v2 (set in the root
// layout's ga-init), so nothing non-essential drops until the visitor chooses
// here. Two equal choices (Accept / Essential only) — no dark pattern. The
// choice persists in the `olivea_consent` cookie; the footer's "Cookies" link
// dispatches `olivea:cookie-prefs` to reopen this so consent can be withdrawn.
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { setConsentSettled } from "@/components/legal/consentFlag";

const CONSENT_COOKIE = "olivea_consent";
const CONSENT_DAYS = 180;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(granted: boolean) {
  Cookies.set(CONSENT_COOKIE, granted ? "granted" : "denied", {
    expires: CONSENT_DAYS,
    path: "/",
    sameSite: "lax",
  });
  const v = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: v,
    analytics_storage: v,
    ad_user_data: v,
    ad_personalization: v,
  });
}

export default function CookieConsent() {
  const pathname = usePathname();
  const es = !pathname?.startsWith("/en");
  const lang = es ? "es" : "en";
  const [open, setOpen] = useState(false);

  // First visit (no stored choice) → reveal after a beat, so it settles in
  // gently rather than fighting first paint.
  useEffect(() => {
    if (Cookies.get(CONSENT_COOKIE)) return;
    const t = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  // Footer "Cookies" link reopens this to change/withdraw consent.
  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener("olivea:cookie-prefs", reopen);
    return () => window.removeEventListener("olivea:cookie-prefs", reopen);
  }, []);

  const choose = useCallback((granted: boolean) => {
    applyConsent(granted);
    setOpen(false);
  }, []);

  // Public marketing pages only — not the internal admin nor the private
  // secure-document viewer (/d on olivea.ai), where GA stays cookieless and a
  // consent banner would just be clutter.
  const hidden =
    pathname?.startsWith("/admin") || pathname === "/d" || pathname?.startsWith("/d/");

  // Tell the rest of the app whether the bottom-left corner is spoken for.
  // The "we're hiring" pill sits in the same corner and waits on this, so a
  // first-time visitor is asked one thing at a time.
  //
  // Settled means: nothing to answer. Either a choice is already stored, or
  // this page never shows the banner at all. Reopening it via the footer's
  // Cookies link flips it back to unsettled.
  useEffect(() => {
    if (hidden) {
      setConsentSettled(true);
      return;
    }
    setConsentSettled(open ? false : !!Cookies.get(CONSENT_COOKIE));
  }, [hidden, open]);

  if (hidden || !open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            // Sit clear of the fixed footer rather than on top of it.
      //
      // --footer-h is published by Footer from a ResizeObserver, so this tracks
      // the real height instead of a hardcoded guess (77px desktop, and it
      // grows when the links wrap). The fallback is 0 on purpose: LayoutShell
      // renders the footer only when !isMobileLike, so on phones there is no
      // footer to clear and a non-zero fallback would strand the banner high
      // above the fold. Footer removes the variable on unmount.
      style={{
        paddingBottom:
          "calc(var(--footer-h, 0px) + 1rem + env(safe-area-inset-bottom))",
      }}
      className="fixed inset-x-0 bottom-0 z-[9998] flex justify-center px-4 pointer-events-none sm:justify-start sm:px-6"
    >
      <div
        role="dialog"
        aria-live="polite"
        aria-label={es ? "Aviso de cookies" : "Cookie notice"}
        className="pointer-events-auto w-full sm:max-w-sm"
      >
        <div className="rounded-2xl border border-[var(--olivea-olive)]/10 bg-[var(--olivea-cream)]/95 p-5 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <h2
            className="text-[15px] font-semibold text-[var(--olivea-ink)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {es ? "Cuidamos tu privacidad" : "We value your privacy"}
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--olivea-ink)]/70">
            {es
              ? "Usamos cookies para entender cómo se usa el sitio y mejorar tu experiencia. Tú decides — las esenciales siempre están activas."
              : "We use cookies to understand how the site is used and improve your experience. Your choice — essential ones are always on."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => choose(true)}
              className="flex-1 rounded-full bg-[var(--olivea-olive)] px-4 py-2 text-[12.5px] font-medium text-[var(--olivea-cream)] transition-colors hover:bg-[var(--olivea-clay)]"
            >
              {es ? "Aceptar" : "Accept"}
            </button>
            <button
              onClick={() => choose(false)}
              className="flex-1 rounded-full border border-[var(--olivea-olive)]/25 px-4 py-2 text-[12.5px] font-medium text-[var(--olivea-ink)]/80 transition-colors hover:bg-white/60"
            >
              {es ? "Solo esenciales" : "Essential only"}
            </button>
          </div>
          <Link
            href={`/${lang}/legal`}
            className="mt-3 inline-block text-[11px] text-[var(--olivea-ink)]/50 underline underline-offset-2 transition-colors hover:text-[var(--olivea-olive)]"
          >
            {es ? "Más información" : "Learn more"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
