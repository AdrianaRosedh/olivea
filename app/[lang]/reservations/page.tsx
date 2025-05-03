// app/[lang]/reservations/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useReservation } from "@/contexts/ReservationContext";
import type { Lang } from "../dictionaries";

export default function ReservationsPage() {
  const router = useRouter();
  const { openReservationModal } = useReservation();

  // 1️⃣ Grab the `lang` segment straight from the URL
  const { lang: raw } = useParams() as { lang: string };

  // 2️⃣ Narrow it to your union
  const lang: Lang = raw === "es" ? "es" : "en";

  useEffect(() => {
    // Open the reservation modal immediately
    openReservationModal();

    // Then send them back home after a tiny delay
    const timer = setTimeout(() => {
      router.push(`/${lang}`);
    }, 100);

    return () => clearTimeout(timer);
  }, [openReservationModal, router, lang]);

  // We render nothing; this page is just a trigger.
  return null;
}