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
// booking app has drawn (1–4 s). A frame can report "loaded" and still show
// nothing: in a Chrome that blocks third-party cookies (2026-10-25) OpenTable
// never draws inside another site. The same page draws there as a
// `credentialless` frame, which starts from a fresh, temporary cookie jar of
// its own (measured: 5.7 s). An earlier attempt at that looked unreliable,
// but only because dozens of test loads in a few minutes had made OpenTable's
// bot protection refuse the network; a guest loads it once or twice.
//
// So, always inside the window, loader up the whole time:
//  1. the ordinary frame (a guest signed in to OpenTable keeps their session);
//  2. no APP_READY in PLAIN_WAIT_MS → the same page as a credentialless frame
//     (Chrome, Edge), and this browser is remembered (FRESH_KEY) so its next
//     opening starts there instead of waiting again;
//  3. still nothing in READY_WAIT_MS (10 s, as when it last worked on every
//     device; a phone on a slow line needs it) → "Book on OpenTable", which
//     opens only when pressed. A late APP_READY shows the booking anyway.
// When OpenTable refuses a whole network (its bot protection does that for
// a while after many loads from one address), every device on that Wi-Fi
// sees the button; that is OpenTable, not this code.
const PLAIN_WAIT_MS = 5_000;
const READY_WAIT_MS = 10_000;
const FRESH_KEY = "olivea:opentable-fresh";
const OPENTABLE_ORIGIN = /^https:\/\/www\.opentable\.com(\.mx)?$/;

const supportsFresh = () =>
  typeof HTMLIFrameElement !== "undefined" && "credentialless" in HTMLIFrameElement.prototype;

function isAppReady(data: unknown): boolean {
  try {
    const msg = typeof data === "string" ? JSON.parse(data) : data;
    return (msg as { type?: unknown } | null)?.type === "APP_READY";
  } catch {
    return false;
  }
}

/** OpenTable's booking page in its own window, centred over the site. The
 *  window cannot steer this page (rel="noopener" does not apply to
 *  window.open with features). Returns null when the browser refuses it. */
function openPopup(url: string): Window | null {
  const w = Math.min(560, window.screen.availWidth);
  const h = Math.min(860, window.screen.availHeight - 40);
  const left = Math.round(window.screenX + Math.max(0, (window.outerWidth - w) / 2));
  const top = Math.round(window.screenY + Math.max(0, (window.outerHeight - h) / 2));
  const win = window.open(url, "olivea-opentable", `popup,width=${w},height=${h},left=${left},top=${top}`);
  if (!win) return null;
  win.opener = null;
  win.focus();
  return win;
}

/**
 * For an OpenTable link's onClick: opens the booking in a window over the
 * site instead of a new tab, so the guest books, closes it, and is still on
 * OLIVEA. If the browser refuses the window (a popup blocker), the link opens
 * normally in a new tab. Phones open it as a tab either way.
 */
export function openOpenTableWindow(e: React.MouseEvent<HTMLAnchorElement>): void {
  // Leave modified clicks (new tab, new window) to the browser.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  if (openPopup(e.currentTarget.href)) e.preventDefault();
}

function OpenTableWidgetImpl({ lang = "es" }: { lang?: "es" | "en" }) {
  const [ready, setReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [popupOpened, setPopupOpened] = useState(false);
  // The fresh-cookie frame (see above). Starts there on a browser that needed
  // it before. Client-only (the widget never renders on the server), so
  // reading storage here is safe.
  const [fresh, setFresh] = useState(() => {
    try {
      return supportsFresh() && localStorage.getItem(FRESH_KEY) === "1";
    } catch {
      return false;
    }
  });
  const freshRef = useRef(fresh);
  useEffect(() => {
    freshRef.current = fresh;
  }, [fresh]);
  // Bumped by "Try here again": a new key remounts the frame.
  const [attempt, setAttempt] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const es = lang === "es";
  const url = openTableUrl(lang);

  useEffect(() => {
    // A mark an earlier version stored ("open OpenTable's window instead");
    // nothing reads it any more.
    try {
      localStorage.removeItem("olivea:opentable-window-until");
    } catch {
      /* storage off */
    }
    const onMessage = (e: MessageEvent) => {
      if (!OPENTABLE_ORIGIN.test(e.origin) || e.source !== frameRef.current?.contentWindow) return;
      if (!isAppReady(e.data)) return;
      setReady(true);
      try {
        if (freshRef.current) localStorage.setItem(FRESH_KEY, "1");
        else localStorage.removeItem(FRESH_KEY);
      } catch {
        /* storage off: it simply tries the ordinary frame first next time */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) return;
    const retryFresh = !fresh && supportsFresh();
    const t = window.setTimeout(
      () => (retryFresh ? setFresh(true) : setStalled(true)),
      retryFresh ? PLAIN_WAIT_MS : READY_WAIT_MS
    );
    return () => window.clearTimeout(t);
  }, [ready, fresh, attempt]);

  const tryHereAgain = () => {
    setReady(false);
    setStalled(false);
    setPopupOpened(false);
    setAttempt((n) => n + 1);
  };

  const showWindowCard = stalled && !ready;

  return (
    <div className="relative w-full h-full min-h-0 bg-(--olivea-cream)" data-lenis-prevent>
      {/* Brand placeholder until OpenTable says it has drawn, so the pane
          never shows a blank or half-drawn frame. */}
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

      {showWindowCard && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-(--olivea-cream) px-6 text-center text-(--olivea-olive)"
        >
          <p
            className="max-w-sm italic text-(--olivea-ink)/80"
            style={{ fontFamily: "var(--font-serif)", fontSize: 19, lineHeight: 1.35 }}
          >
            {popupOpened
              ? es ? "Tu reservación está abierta en la ventana de OpenTable." : "Your booking is open in the OpenTable window."
              : es ? "Reserva en una ventana de OpenTable." : "Book in an OpenTable window."}
          </p>
          <span className="-mt-2 max-w-sm text-[13px] text-(--olivea-ink)/65">
            {popupOpened
              ? es ? "Al terminar, ciérrala y sigues aquí." : "When you’re done, close it and you’re still here."
              : es
                ? "Este navegador no deja que OpenTable se muestre dentro de nuestra página; en su propia ventana carga en un instante."
                : "This browser won’t let OpenTable show inside our page; in its own window it loads in a moment."}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              openOpenTableWindow(e);
              if (e.defaultPrevented) setPopupOpened(true);
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-(--olivea-olive) px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-(--olivea-cream) shadow-[0_10px_24px_-14px_rgba(40,60,35,0.7)] transition-colors hover:bg-(--olivea-clay)"
          >
            {popupOpened
              ? es ? "Volver a abrir OpenTable" : "Open OpenTable again"
              : es ? "Reservar en OpenTable" : "Book on OpenTable"}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={tryHereAgain}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--olivea-olive)/70 underline-offset-4 hover:underline"
          >
            {es ? "Intentar aquí de nuevo" : "Try here again"}
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
        src={url}
        className="block w-full h-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="payment *; publickey-credentials-get *; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
      />
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);
