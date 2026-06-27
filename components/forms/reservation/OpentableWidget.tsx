"use client";

import React, { useState } from "react";

/**
 * OpenTable reservation WIDGET — the "mural" picker, embedded directly.
 *
 * Why this and not the alternatives:
 *  - /booking/restref/availability needs OpenTable's session cookie, blocked
 *    as third-party inside our iframe → blank for many guests (Safari/VPN/etc).
 *  - /widget/reservation/demo-widget is the configurator PREVIEW and sends
 *    anti-framing headers (ERR_BLOCKED_BY_RESPONSE) → cannot be embedded.
 *  - /widget/reservation/loader renders the mural but ignores custom colors
 *    (defaults to OpenTable red), which reads as off-brand inside the modal.
 *
 * The mural is a stateless date/time/party picker that hands off to OpenTable
 * in a NEW TAB to finish (isNewTab=true), so it needs no third-party cookie
 * and renders in every browser. Styled to Olivea's palette via OpenTable's own
 * params: primaryColor e7eae1 (shell), buttonColor 5e7658 (olive), Georgia.
 *
 * Note: mural is OpenTable's widget-internal endpoint. If they ever change it,
 * the "Reservar en OpenTable" link in the pane header is the always-works path.
 */
const WIDGET_W = 320;
const WIDGET_H = 520;
// OpenTable prints a "Hacer reservación" heading at the top of the mural that
// we can't remove from the cross-origin iframe, so mask it with an overflow
// crop (shift the iframe up, clip the wrapper). Calendar starts the content.
const CROP_TOP = 48;

function buildMuralSrc(uuid: string): string {
  const p = new URLSearchParams({
    restaurantIds: "1313743",
    type: "standard",
    theme: "tall",
    isIframe: "true",
    lang: "es-MX",
    isNewTab: "true",
    otSource: "Restaurant website",
    domain: "commx",
    colorThemeId: "8",
    isDarkMode: "false",
    font: "Georgia",
    primaryColor: "e7eae1",
    primaryFontColor: "333333",
    buttonColor: "5e7658",
    buttonFontColor: "ffffff",
    logoPid: "0",
    backgroundPid: "0",
    demo: "false",
    otLogo: "subtle",
    loadAllWidgets: "false",
    uuid,
  });
  return `https://www.opentable.com.mx/widget/reservation/mural?${p.toString()}`;
}

function makeUuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `olivea-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function OpenTableWidgetImpl({ lang = "es" }: { lang?: "es" | "en" }) {
  const [loaded, setLoaded] = useState(false);
  const [src] = useState(() => buildMuralSrc(makeUuid()));

  return (
    <div className="relative w-full h-full min-h-0 bg-(--olivea-cream) overflow-auto">
      {/* Brand placeholder until the widget paints, so the pane never flashes blank. */}
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

      <div className="flex min-h-full w-full items-center justify-center p-4">
        {/* Overflow mask that crops OpenTable's heading off the top. */}
        <div
          className="max-w-full"
          style={{
            width: WIDGET_W,
            height: WIDGET_H - CROP_TOP,
            overflow: "hidden",
            borderRadius: 12,
          }}
        >
          <iframe
            title="Reservar en Olivea Farm To Table en OpenTable"
            src={src}
            onLoad={() => setLoaded(true)}
            referrerPolicy="strict-origin-when-cross-origin"
            scrolling="yes"
            style={{
              display: "block",
              width: WIDGET_W,
              height: WIDGET_H,
              marginTop: -CROP_TOP,
              border: "none",
              background: "transparent",
            }}
            allow="fullscreen; payment; clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);
