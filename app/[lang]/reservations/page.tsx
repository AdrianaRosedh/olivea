"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReservation } from "@/contexts/ReservationContext";
import type { Lang } from "../dictionaries";

interface ReservationsPageProps {
  params: { lang: string };
}

export default function ReservationsPage({ params }: ReservationsPageProps) {
  const router = useRouter();
  const { openReservationModal } = useReservation();

  // 1️⃣ Coerce the incoming string into your Lang union
  const raw = params.lang;
  const lang: Lang = raw === "es" ? "es" : "en";

  useEffect(() => {
    // 2️⃣ Open the modal immediately
    openReservationModal();

    // 3️⃣ Then redirect back home after a short pause
    const timer = setTimeout(() => {
      router.push(`/${lang}`);
    }, 100);

    return () => clearTimeout(timer);
  }, [openReservationModal, router, lang]);

  // No UI to render: this page simply triggers the modal + redirect
  return null;
}