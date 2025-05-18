// components/layout/ClientLangLayout.tsx
"use client";

import type { ReactNode } from "react";
import type { Lang, AppDictionary } from "@/app/[lang]/dictionaries";
import LayoutShell from "./LayoutShell";
import ClientProviders from "@/components/providers/ClientProviders";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";
import ReservationModal from "@/components/forms/reservation/ReservationModal";

interface ClientLangLayoutProps {
  children: ReactNode;
  lang: Lang;                // use your Lang type
  dict: AppDictionary;       // use your dictionary type
}

export default function ClientLangLayout({
  children,
  lang,
  dict,
}: ClientLangLayoutProps) {
  return (
    <SharedTransitionProvider>
      <ReservationProvider>
        <ScrollProvider>
          <ClientProviders>
            <LayoutShell lang={lang} dictionary={dict}>
              {/* Always mount the reservation modal */}
              <ReservationModal lang={lang} />
              {children}
            </LayoutShell>
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>
      <SharedVideoTransition />
    </SharedTransitionProvider>
  );
}
