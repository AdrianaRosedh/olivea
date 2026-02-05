"use client";
import dynamic from "next/dynamic";

// Only here do we dynamically import the Context-using tracker
const MobileSectionTracker = dynamic(
  () => import("@/components/navigation/MobileSectionTracker"),
  { ssr: false }
);

export default function TrackerLoader({ sectionIds }) {
  return <MobileSectionTracker sectionIds={sectionIds} />;
}
