// app/providers.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import ClientProviders from "@/components/providers/ClientProviders";
import ReservationModal from "@/components/forms/reservation/ReservationModal";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

/**
 * Our own minimal version of the connection API
 */
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
}

function ConditionalPreloads() {
  const [shouldPreload, setShouldPreload] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const conn = nav.connection;

    // if no API or not on 2g, enable preloads
    if (!conn || !/2g/.test(conn.effectiveType || "")) {
      setShouldPreload(true);
    }
  }, []);

  if (!shouldPreload) return null;

  return (
    <Head>
      {/* Hero video (high priority) */}
      <link
        rel="preload"
        href="/videos/homepage-temp.webm"
        as="video"
        type="video/webm"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/videos/homepage-temp.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="high"
      />

      {/* Card transitions (low priority) */}
      <link
        rel="preload"
        href="/videos/transition1.webm"
        as="video"
        type="video/webm"
        fetchPriority="low"
      />
      <link
        rel="preload"
        href="/videos/transition1.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="low"
      />

      <link
        rel="preload"
        href="/videos/transition2.webm"
        as="video"
        type="video/webm"
        fetchPriority="low"
      />
      <link
        rel="preload"
        href="/videos/transition2.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="low"
      />

      <link
        rel="preload"
        href="/videos/transition3.webm"
        as="video"
        type="video/webm"
        fetchPriority="low"
      />
      <link
        rel="preload"
        href="/videos/transition3.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="low"
      />
    </Head>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SharedTransitionProvider>
      <ReservationProvider>
        <ScrollProvider>
          <ClientProviders>
            {/* Preload video assets on good connections */}
            <ConditionalPreloads />

            {children}
            <ReservationModal lang="es" />
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>

      {/* Shared-element video transition overlay */}
      <SharedVideoTransition />
    </SharedTransitionProvider>
  );
}