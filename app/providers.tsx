// app/providers.tsx
"use client";

import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { CafeHours } from "@/components/forms/reservation/ReservationModal";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import {
  SharedTransitionProvider,
  useSharedTransition,
} from "@/contexts/SharedTransitionContext";
import {
  ReservationProvider,
  useReservation,
} from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";
import PathTracker from "@/components/PathTracker";

interface AppProvidersProps {
  children: ReactNode;
  /** The café's opening hours, for the reservation window's café tab. */
  cafeHours?: CafeHours | null;
}

/* ========== Lazy bits ========== */

// Reservation modal: only loaded when actually needed
const ReservationModal = dynamic(
  () => import("@/components/forms/reservation/ReservationModal"),
  { ssr: false, loading: () => null }
);

// Video overlay: lazy-load ONLY on intent or when active
const SharedVideoTransitionLazy = dynamic(
  () => import("@/components/ui/SharedVideoTransition"),
  { ssr: false, loading: () => null }
);

// Live garden map overlay: always mounted (button is tiny, overlay is lazy)
const LiveGarden = dynamic(
  () => import("@/components/live-garden/LiveGarden"),
  { ssr: false, loading: () => null }
);

/* ========== Conditional shells ========== */

/** The floating LiveGarden button shows site-wide EXCEPT on the secure
 *  document pages (/d/*), which must stay branding-free. */
function ConditionalLiveGarden() {
  const pathname = usePathname();
  if (pathname === "/d" || pathname?.startsWith("/d/")) return null;
  return <LiveGarden />;
}

/** Open the connection to a booking engine's host ahead of the click: DNS,
 *  TCP and TLS are then done when the frame asks for its first page. Added
 *  once per host; harmless if the guest never opens the window. */
function preconnectOnce(href: string) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = href;
  document.head.appendChild(link);
}

/** The reservation window: its code loads once the page has settled, so the
 *  first Reserve opens at once instead of first downloading the window (about
 *  a second, measured on the live site). Nothing inside it loads until it
 *  opens: the booking engines start only then. */
const ConditionalReservationModal = ({ cafeHours }: { cafeHours?: CafeHours | null }) => {
  const { isOpen } = useReservation();
  // The window speaks the page's language. "/" is the Spanish site (rewrite),
  // so only an /en address is English. It was fixed to "es", which showed
  // English visitors a Spanish reservation window.
  const pathname = usePathname();
  const lang = pathname?.startsWith("/en") ? "en" : "es";
  const [warm, setWarm] = useState(false);
  const [shouldMount, setShouldMount] = useState(false); // ⬅️ latch

  useEffect(() => {
    const prewarm = () => {
      setWarm(true);
      preconnectOnce("https://www.opentable.com.mx");
      preconnectOnce("https://hotels.cloudbeds.com");
    };

    const onPointerOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-reserve-intent]")) prewarm();
    };

    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("olivea:reserve-intent", prewarm as EventListener);

    // Load the window's code once the page is idle, a few seconds in, so it
    // never competes with the page's own first load.
    let idle = 0;
    const settle = window.setTimeout(() => {
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(() => setWarm(true), { timeout: 3000 });
      else setWarm(true);
    }, 3000);

    return () => {
      window.clearTimeout(settle);
      if (idle) window.cancelIdleCallback?.(idle);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener(
        "olivea:reserve-intent",
        prewarm as EventListener
      );
    };
  }, []);

  // ⬇️ once true, stays true for the session (so exit can play)
  useEffect(() => {
    if (isOpen || warm) setShouldMount(true);
  }, [isOpen, warm]);

  if (!shouldMount) return null;
  return <ReservationModal lang={lang} cafeHours={cafeHours} />;
};

/**
 * TransitionOverlayGate
 * - Renders the overlay ONLY when:
 *   1) a route transition using the shared video actually starts (isActive), OR
 *   2) user shows intent (first hover) on any element with [data-transition-intent],
 *      or a custom event `olivea:transition-intent` is dispatched.
 */
function TransitionOverlayGate() {
  const { isActive } = useSharedTransition();
  const [warm, setWarm] = useState(false);

  // If a transition starts, ensure overlay is loaded
  useEffect(() => {
    if (isActive) setWarm(true);
  }, [isActive]);

  // “Hover intent” prewarm + optional custom event
  useEffect(() => {
    const onIntent = () => setWarm(true);

    const onPointerOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-transition-intent]")) setWarm(true);
    };

    // Custom events may be dispatched from anywhere in the app
    window.addEventListener("olivea:transition-intent", onIntent as EventListener);
    window.addEventListener("pointerover", onPointerOver, { passive: true });

    return () => {
      window.removeEventListener(
        "olivea:transition-intent",
        onIntent as EventListener
      );
      window.removeEventListener("pointerover", onPointerOver);
    };
  }, []);

  if (!warm && !isActive) return null;
  return <SharedVideoTransitionLazy />;
}

export function AppProviders({ children, cafeHours }: AppProvidersProps) {
  // React is live: confirm the js-hydrated marker and cancel the
  // pre-hydration watchdog (see the inline script in app/layout.tsx).
  useLayoutEffect(() => {
    const w = window as Window & { __oliveaHydration?: number };
    if (w.__oliveaHydration) clearTimeout(w.__oliveaHydration);
    document.documentElement.classList.add("js-hydrated");
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      {/* Honor prefers-reduced-motion across every motion component:
          transform/layout animations are skipped, opacity still resolves,
          so animated content always becomes visible. */}
      <MotionConfig reducedMotion="user">
      <SharedTransitionProvider>
        <ReservationProvider>
          <ScrollProvider>
            <ClientProviders>
              {/* ✅ IMPORTANT: mounts the unlock-on-navigation safety net */}
              <PathTracker />

              {children}
              <ConditionalReservationModal cafeHours={cafeHours} />
              <ConditionalLiveGarden />
            </ClientProviders>
          </ScrollProvider>
        </ReservationProvider>

        {/* ⬇️ Overlay now deferred until intent/active */}
        <TransitionOverlayGate />
      </SharedTransitionProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
