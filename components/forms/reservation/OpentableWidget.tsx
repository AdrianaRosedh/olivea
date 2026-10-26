"use client";

import React, { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

/**
 * OpenTable's full booking page, inside the reservation modal — the same way
 * Casa Olivea's booking engine sits in its pane, so a guest finds a table,
 * picks the experience and pays without leaving the site.
 *
 * This replaced the "mural" picker, which only chose date, time and party and
 * then sent the guest to OpenTable in a new tab to finish.
 *
 * Known limits, measured on 2026-10-25 by framing this page from another
 * origin in WebKit with every opentable.com cookie stripped (what Safari does
 * to a third-party frame):
 *  - Searching an open day works and lists times.
 *  - Searching a day with no tables returns OpenTable's "no pudimos completar
 *    tu solicitud" instead of suggesting other days (fine with cookies).
 *  - The details and payment step could not be checked that way (OpenTable's
 *    bot protection refused the test browser). The owner then made a real
 *    booking with payment on an iPhone in Safari, inside the modal, and it
 *    went through (2026-10-25). Re-check that way after changing the frame.
 *  - OpenTable shows its own cookie banner inside the frame, and Safari cannot
 *    keep the answer, so iPhone guests may see it each time.
 * The "Reservar en OpenTable" link in the pane header and the phone sheet is
 * the path that always works; keep it.
 */
export function openTableUrl(lang: "es" | "en"): string {
  const p = new URLSearchParams({
    lang: lang === "en" ? "en-US" : "es-MX",
    restRef: "1313743",
    otSource: "Restaurant website",
  });
  return `https://www.opentable.com.mx/booking/restref/availability?${p.toString()}`;
}

// OpenTable's page posts {"type":"APP_READY"} to the embedding page once its
// booking app has drawn (about 2–5 s). A frame can report "loaded" and still
// show nothing, and the guest saw a blank pane.
//
// The cause, found in a Chrome where it happened (2026-10-25): the cookies
// Chrome hands OpenTable inside another site. The same page in the same
// Chrome drew fine as a `credentialless` frame, which starts from a fresh,
// temporary cookie jar of its own. So the pane first loads the ordinary frame
// (a guest signed in to OpenTable keeps their session); with no APP_READY in
// PLAIN_WAIT_MS it reloads once as credentialless where the browser supports
// it (Chrome, Edge); only then, after READY_TIMEOUT_MS more, does it offer the
// booking on OpenTable itself.
const PLAIN_WAIT_MS = 5_000;
const READY_TIMEOUT_MS = 10_000;
const OPENTABLE_ORIGIN = /^https:\/\/www\.opentable\.com(\.mx)?$/;

function isAppReady(data: unknown): boolean {
  try {
    const msg = typeof data === "string" ? JSON.parse(data) : data;
    return (msg as { type?: unknown } | null)?.type === "APP_READY";
  } catch {
    return false;
  }
}

function OpenTableWidgetImpl({ lang = "es" }: { lang?: "es" | "en" }) {
  const [ready, setReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  // Second try: a credentialless frame (see above).
  const [fresh, setFresh] = useState(false);
  // Bumped by "Try again": a new key remounts the frame and restarts the wait.
  const [attempt, setAttempt] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const es = lang === "es";

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!OPENTABLE_ORIGIN.test(e.origin) || e.source !== frameRef.current?.contentWindow) return;
      if (isAppReady(e.data)) setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) return;
    const canRetryFresh = !fresh && "credentialless" in HTMLIFrameElement.prototype;
    const t = window.setTimeout(
      () => (canRetryFresh ? setFresh(true) : setStalled(true)),
      canRetryFresh ? PLAIN_WAIT_MS : READY_TIMEOUT_MS
    );
    return () => window.clearTimeout(t);
  }, [ready, attempt, fresh]);

  const retry = () => {
    setReady(false);
    setStalled(false);
    setFresh(false);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="relative w-full h-full min-h-0 bg-(--olivea-cream)" data-lenis-prevent>
      {/* Brand placeholder until OpenTable says it has drawn, so the pane
          never shows a blank or half-drawn frame, nor the switch to the
          second try. */}
      <div
        aria-hidden
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-(--olivea-cream) text-(--olivea-olive) transition-opacity duration-500 ${
          ready || stalled ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span className="h-7 w-7 rounded-full border-2 border-(--olivea-olive)/25 border-t-(--olivea-olive) animate-spin" />
        <span className="text-xs uppercase tracking-[0.18em] opacity-80">
          {lang === "en" ? "Loading reservations…" : "Cargando reservaciones…"}
        </span>
      </div>

      {stalled && !ready && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-(--olivea-cream) px-6 text-center text-(--olivea-olive)"
        >
          <p
            className="max-w-sm italic text-(--olivea-ink)/80"
            style={{ fontFamily: "var(--font-serif)", fontSize: 19, lineHeight: 1.35 }}
          >
            {es ? "La reservación no pudo abrirse aquí." : "The booking couldn’t open here."}
          </p>
          <span className="-mt-2 max-w-sm text-[13px] text-(--olivea-ink)/65">
            {es
              ? "Algunos navegadores y bloqueadores de anuncios lo impiden. Reserva directamente en OpenTable."
              : "Some browsers and ad blockers stop it. Book directly on OpenTable instead."}
          </span>
          <a
            href={openTableUrl(lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-(--olivea-olive) px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-(--olivea-cream) shadow-[0_10px_24px_-14px_rgba(40,60,35,0.7)] transition-colors hover:bg-(--olivea-clay)"
          >
            {es ? "Reservar en OpenTable" : "Book on OpenTable"}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={retry}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--olivea-olive)/70 underline-offset-4 hover:underline"
          >
            {es ? "Intentar de nuevo" : "Try again"}
          </button>
        </div>
      )}

      {/* `allow` hands the wallet and passkey features to OpenTable's payment
          step, as for the hotel. The sandbox keeps OpenTable from navigating
          the site; allow-storage-access-by-user-activation lets Safari grant
          its cookies after a tap, if OpenTable asks for them. */}
      <iframe
        key={`${attempt}-${fresh}`}
        ref={frameRef}
        // React DOM treats `credentialless` as a boolean attribute; its types
        // don't list it yet, hence the spread.
        {...(fresh ? { credentialless: true } : {})}
        title={
          lang === "en"
            ? "Reserve at Olivea Farm To Table on OpenTable"
            : "Reservar en Olivea Farm To Table en OpenTable"
        }
        src={openTableUrl(lang)}
        className="block w-full h-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="payment *; publickey-credentials-get *; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
      />
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);
