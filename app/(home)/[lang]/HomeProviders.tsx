// app/(home)/HomeProviders.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

// Extend Navigator to safely read network status
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
}

interface HomeProvidersProps {
  children: ReactNode;
}

export function HomeProviders({ children }: HomeProvidersProps) {
  const [preload, setPreload] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connType = nav.connection?.effectiveType;
    // Preload videos unless on a slow 2G connection
    if (!connType || !connType.includes("2g")) {
      setPreload(true);
    }
  }, []);

  return (
    <>
      {preload && (
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

          {/* Card transition videos (low priority) */}
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
      )}

      {/* Render the homepage content */}
      {children}

      {/* Homepage-only full-screen intro overlay */}
      <SharedVideoTransition />
    </>
  );
}
