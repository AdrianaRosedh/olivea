// app/providers.tsx
"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";

interface AppProvidersProps {
  children: ReactNode;
}

// Lazy-load ReservationModal once, for all pages:
const ReservationModal = dynamic(
  () => import("@/components/forms/reservation/ReservationModal"),
  { ssr: false, loading: () => null }
);

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SharedTransitionProvider>
      <ReservationProvider>
        <ScrollProvider>
          <ClientProviders>
            {children}
            {/* Global reservation modal, available on every page */}
            <ReservationModal lang="es" />
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>
    </SharedTransitionProvider>
  );
}
