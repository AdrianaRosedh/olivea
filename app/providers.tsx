// app/providers.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LazyMotion, domAnimation } from "framer-motion";
import { SharedTransitionProvider, useSharedTransition } from "@/contexts/SharedTransitionContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";

interface AppProvidersProps {
  children: ReactNode;
}

/* ========== Lazy bits ========== */

// Reservation modal: already good to lazy-load
const ReservationModal = dynamic(
  () => import("@/components/forms/reservation/ReservationModal"),
  { ssr: false, loading: () => null }
);

// Video overlay: lazy-load ONLY on intent or when active
const SharedVideoTransitionLazy = dynamic(
  () => import("@/components/ui/SharedVideoTransition"),
  { ssr: false, loading: () => null }
);

/* ========== Conditional shells ========== */

const ConditionalReservationModal = () => {
  return <ReservationModal lang="es" />;
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

    const onPointerOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const hit = t?.closest?.("[data-transition-intent]");
      if (hit) setWarm(true);
    };

    window.addEventListener("olivea:transition-intent", onIntent as EventListener);
    window.addEventListener("pointerover", onPointerOver, { passive: true } as AddEventListenerOptions);

    return () => {
      window.removeEventListener("olivea:transition-intent", onIntent as EventListener);
      window.removeEventListener("pointerover", onPointerOver as EventListener);
    };
  }, []);

  // Render overlay only when needed
  if (!warm && !isActive) return null;
  return <SharedVideoTransitionLazy />;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LazyMotion features={domAnimation}>
      <SharedTransitionProvider>
        <ReservationProvider>
          <ScrollProvider>
            <ClientProviders>
              {children}
              <ConditionalReservationModal />
            </ClientProviders>
          </ScrollProvider>
        </ReservationProvider>

        {/* ⬇️ Overlay now deferred until intent/active */}
        <TransitionOverlayGate />
      </SharedTransitionProvider>
    </LazyMotion>
  );
}
