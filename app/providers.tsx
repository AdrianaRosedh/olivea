"use client";

import { ReactNode } from "react";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SharedTransitionProvider>
      {children}
      <SharedVideoTransition />
    </SharedTransitionProvider>
  );
}
