"use client";

import React, { useState } from "react";

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

function OpenTableWidgetImpl({ lang = "es" }: { lang?: "es" | "en" }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full min-h-0 bg-(--olivea-cream)" data-lenis-prevent>
      {/* Brand placeholder until the page paints, so the pane never flashes blank. */}
      <div
        aria-hidden
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-(--olivea-cream) text-(--olivea-olive) transition-opacity duration-500 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span className="h-7 w-7 rounded-full border-2 border-(--olivea-olive)/25 border-t-(--olivea-olive) animate-spin" />
        <span className="text-xs uppercase tracking-[0.18em] opacity-80">
          {lang === "en" ? "Loading reservations…" : "Cargando reservaciones…"}
        </span>
      </div>

      {/* `allow` hands the wallet and passkey features to OpenTable's payment
          step, as for the hotel. The sandbox keeps OpenTable from navigating
          the site; allow-storage-access-by-user-activation lets Safari grant
          its cookies after a tap, if OpenTable asks for them. */}
      <iframe
        title={
          lang === "en"
            ? "Reserve at Olivea Farm To Table on OpenTable"
            : "Reservar en Olivea Farm To Table en OpenTable"
        }
        src={openTableUrl(lang)}
        onLoad={() => setLoaded(true)}
        className="block w-full h-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="payment *; publickey-credentials-get *; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
      />
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);
