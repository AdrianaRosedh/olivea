"use client";

import { ReactNode, useEffect, useState } from "react";
import NavigationProvider from "@/components/NavigationProvider";
import MobileAudioFeedback from "@/components/ui/MobileAudioFeedback";
import AnimationInitializer from "@/components/animations/AnimationInitializer";
import NextGenBackgroundInitializer from "@/components/animations/NextGenBackgroundInitializer";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // detect mobile
    if (typeof navigator !== "undefined") {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isMobileDevice);
    }
  }, []);

  if (!mounted) return null;

  return (
    <NavigationProvider>
      <AnimationInitializer />
      <NextGenBackgroundInitializer />
      {isMobile && <MobileAudioFeedback />}
      {children}
    </NavigationProvider>
  );
}