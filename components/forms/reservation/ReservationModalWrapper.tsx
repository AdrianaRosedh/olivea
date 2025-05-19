"use client";

import dynamic from "next/dynamic";

const ReservationModal = dynamic(
  () => import("./ReservationModal"),
  { ssr: false }
);

export default function ReservationModalWrapper({ lang }: { lang: "es" | "en" }) {
  return <ReservationModal lang={lang} />;
}
