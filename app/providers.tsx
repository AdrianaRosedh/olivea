// app/providers.tsx
"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
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

export function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname();
  // Home paths: "/", "/en", or "/es"
  const isHome = pathname === "/" || /^\/(en|es)\/?$/.test(pathname);

  return (
    <SharedTransitionProvider>
      <ReservationProvider>
        <ScrollProvider>
          <ClientProviders>
            {children}
            {/* Global reservation modal */}
            <ReservationModal lang="es" />
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>

      {/* Only show the shared-element video transition on non-home pages */}
      {!isHome && <SharedVideoTransition />}
    </SharedTransitionProvider>
  );
}
