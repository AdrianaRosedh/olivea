"use client";

import { ReactNode, useEffect, useState } from "react";
import MobileAudioFeedback           from "@/components/ui/MobileAudioFeedback";
import NextGenBackgroundInitializer  from "@/components/animations/NextGenBackgroundInitializer";
import NextGenBackground             from "@/components/animations/NextGenBackground";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof navigator !== "undefined") {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* 1) Wire up Lenis scroll → background events */}
      <NextGenBackgroundInitializer />

      {/* 2) Render the scroll‐driven background layer */}
      <NextGenBackground />

      {/* 3) Trigger audio feedback on mobile when sections come into view */}
      {isMobile && <MobileAudioFeedback />}

      {/* 4) Finally, render the rest of your app */}
      {children}
    </>
  );
}