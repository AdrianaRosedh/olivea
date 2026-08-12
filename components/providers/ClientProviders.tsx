"use client";

import { ReactNode, useEffect, useState } from "react";
import MobileAudioFeedback from "@/components/ui/MobileAudioFeedback";

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

  // Do NOT gate `children` on `mounted`.
  //
  // Returning null until the effect ran meant the server rendered nothing for
  // the entire app: article pages came back with a 372-byte <body> and 69% of
  // the payload as RSC script, so the browser could not see a single heading or
  // image until JS had downloaded, parsed and hydrated. Only the mobile-only
  // widget needs to wait for the UA check.
  return (
    <>
      {mounted && isMobile && <MobileAudioFeedback />}
      {children}
    </>
  );
}