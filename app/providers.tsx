// app/providers.tsx
"use client";

import { ReactNode } from "react";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import ClientProviders from "@/components/providers/ClientProviders";
import ReservationModal from "@/components/forms/reservation/ReservationModal";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SharedTransitionProvider>
      <ReservationProvider>
        <ScrollProvider>
          <ClientProviders>
            {children}
            <ReservationModal lang="es" /> {/* Adjust language as needed */}
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>
      <SharedVideoTransition />
    </SharedTransitionProvider>
  );
}
