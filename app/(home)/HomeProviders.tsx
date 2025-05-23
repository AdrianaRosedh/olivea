// app/(home)/HomeProviders.tsx
"use client";

import { ReactNode, useEffect, useState, Fragment } from "react";
import Head from "next/head";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

// ——— Extend Navigator with the `connection.effectiveType` property ———
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
    // Cast navigator to our extended interface instead of `any`
    const nav = navigator as NavigatorWithConnection;
    const slow2g = nav.connection?.effectiveType?.includes("2g");
    if (!slow2g) {
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

          {/* Transition videos (low priority) */}
          {["transition1", "transition2", "transition3"].map((n) => (
            <Fragment key={n}>
              <link
                rel="preload"
                href={`/videos/${n}.webm`}
                as="video"
                type="video/webm"
                fetchPriority="low"
              />
              <link
                rel="preload"
                href={`/videos/${n}.mp4`}
                as="video"
                type="video/mp4"
                fetchPriority="low"
              />
            </Fragment>
          ))}
        </Head>
      )}

      {children}

      {/* the “shared transition” overlay when you navigate away */}
      <SharedVideoTransition />
    </>
  );
}