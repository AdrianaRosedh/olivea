"use client"; // Ensure this is only on the client

import { Suspense, useState, useEffect } from "react";
import { ReactNode } from "react";
import StructuredData from "@/components/seo/StructuredData";
import LayoutShell from "@/components/layout/LayoutShell";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";
import ReservationModal from "@/components/forms/reservation/ReservationModal";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";
import { loadLocale } from "@/lib/i18n";
import { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

interface LangLayoutProps {
  children: ReactNode;
  params: { lang: Lang };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  const [langData, setLangData] = useState<{ lang: Lang; dict: AppDictionary } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadLocale(params);
      setLangData(data); // Set fetched data
    };

    fetchData();
  }, [params]);

  if (!langData) return <div>Loading...</div>; // Show loading while fetching

  const { lang, dict } = langData;

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <StructuredData lang={lang} />
        <SharedTransitionProvider>
          <ReservationProvider>
            <ScrollProvider>
              <ClientProviders>
                <LayoutShell lang={lang} dictionary={dict}>
                  <ReservationModal lang={lang} />
                  {children}
                </LayoutShell>
              </ClientProviders>
            </ScrollProvider>
          </ReservationProvider>
          <SharedVideoTransition />
        </SharedTransitionProvider>
      </Suspense>
    </>
  );
}