// app/providers.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LazyMotion, domAnimation } from "framer-motion";
import {
  SharedTransitionProvider,
  useSharedTransition,
} from "@/contexts/SharedTransitionContext";
import { ReservationProvider, useReservation } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";

interface AppProvidersProps {
  children: ReactNode;
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

/* ========== Conditional shells ========== */

/** Load & render reservation modal only when it's open (saves a chunk on idle pages). */
const ConditionalReservationModal = () => {
  const { isOpen } = useReservation();
  if (!isOpen) return null;
  // If you localize by route, swap "es" for detected lang
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

    const onPointerOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-transition-intent]")) setWarm(true);
    };

    // Custom events may be dispatched from anywhere in the app
    window.addEventListener("olivea:transition-intent", onIntent as EventListener);
    window.addEventListener("pointerover", onPointerOver, { passive: true });

    return () => {
      window.removeEventListener("olivea:transition-intent", onIntent as EventListener);
      window.removeEventListener("pointerover", onPointerOver);
    };
  }, []);

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
