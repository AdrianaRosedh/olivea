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
// nothing: in some Chrome browsers (2026-10-25) OpenTable never draws inside
// another site, because of the cookies Chrome hands it there. A credentialless
// second try (fresh cookie jar) drew once, then OpenTable's bot protection
// refused the next ones (each looks like a brand-new visitor), so it was
// dropped.
//
// What works everywhere is OpenTable as a page of its own, in a window over
// the site (about 1.5 s). So: no APP_READY in READY_WAIT_MS → offer that
// window, and remember this browser for REMEMBER_MS; next time the pane goes
// straight to the window (opened at once on desktop, from the guest's click).
// A late APP_READY (slow network, not a blocked browser) shows the booking
// after all and forgets the mark.
const READY_WAIT_MS = 5_000;
const WINDOW_KEY = "olivea:opentable-window-until";
const REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;
const OPENTABLE_ORIGIN = /^https:\/\/www\.opentable\.com(\.mx)?$/;

function isAppReady(data: unknown): boolean {
  try {
    const msg = typeof data === "string" ? JSON.parse(data) : data;
    return (msg as { type?: unknown } | null)?.type === "APP_READY";
  } catch {
    return false;
  }
}

function rememberWindow(on: boolean) {
  try {
    if (on) localStorage.setItem(WINDOW_KEY, String(Date.now() + REMEMBER_MS));
    else localStorage.removeItem(WINDOW_KEY);
  } catch {
    /* storage off: it simply tries the frame again next time */
  }
}

function windowRemembered(): boolean {
  try {
    return Number(localStorage.getItem(WINDOW_KEY) ?? 0) > Date.now();
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

function OpenTableWidgetImpl({
  lang = "es",
  active = true,
}: {
  lang?: "es" | "en";
  /** The pane is on screen (not pre-mounted behind another house). */
  active?: boolean;
}) {
  // "window": this browser cannot show OpenTable inside the site. Client-only
  // (the widget never renders on the server), so reading storage here is safe.
  const [mode, setMode] = useState<"frame" | "window">(() => (windowRemembered() ? "window" : "frame"));
  const [ready, setReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [popupOpened, setPopupOpened] = useState(false);
  // Bumped by "Try here again": a new key remounts the frame.
  const [attempt, setAttempt] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const es = lang === "es";
  const url = openTableUrl(lang);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!OPENTABLE_ORIGIN.test(e.origin) || e.source !== frameRef.current?.contentWindow) return;
      if (!isAppReady(e.data)) return;
      setReady(true);
      rememberWindow(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (mode !== "frame" || ready) return;
    const t = window.setTimeout(() => {
      setStalled(true);
      rememberWindow(true);
    }, READY_WAIT_MS);
    return () => window.clearTimeout(t);
  }, [mode, ready, attempt]);

  // A remembered browser on desktop: the guest's click (Reserve, or the Farm
  // To Table card or tab) opens OpenTable's window at once. Only while the
  // pane is on screen, and only on a real click (the browser would block it
  // otherwise). Phones show the button instead: a tab opening by itself
  // there feels like being thrown off the site.
  useEffect(() => {
    if (mode !== "window" || !active) return;
    const desktop = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
    const fromClick = navigator.userActivation?.isActive ?? false;
    if (desktop && fromClick && openPopup(url)) setPopupOpened(true);
  }, [mode, active, url]);

  const tryHereAgain = () => {
    rememberWindow(false);
    setReady(false);
    setStalled(false);
    setPopupOpened(false);
    setMode("frame");
    setAttempt((n) => n + 1);
  };

  const showWindowCard = mode === "window" || (stalled && !ready);

  return (
    <div className="relative w-full h-full min-h-0 bg-(--olivea-cream)" data-lenis-prevent>
      {/* Brand placeholder until OpenTable says it has drawn, so the pane
          never shows a blank or half-drawn frame. */}
      {mode === "frame" && (
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
      )}

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
          its cookies after a tap, if OpenTable asks for them. Not loaded at
          all in "window" mode. */}
      {mode === "frame" && (
        <iframe
          key={attempt}
          ref={frameRef}
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
      )}
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);
