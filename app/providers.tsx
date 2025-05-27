// app/providers.tsx
"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

interface AppProvidersProps {
  children: ReactNode;
}

// Lazy-load ReservationModal once, for all pages:
const ReservationModal = dynamic(
  () => import("@/components/forms/reservation/ReservationModal"),
  { ssr: false, loading: () => null }
);

// This wrapper component checks context and conditionally renders the modal
const ConditionalReservationModal = () => {
  return <ReservationModal lang="es" />;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SharedTransitionProvider>
      <ReservationProvider>
        <ScrollProvider>
          <ClientProviders>
            {children}
            <ConditionalReservationModal /> {/* Render only if isOpen */}
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>
      <SharedVideoTransition />
    </SharedTransitionProvider>
  );
}