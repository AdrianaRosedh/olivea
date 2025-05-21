// app/[lang]/restaurant/RestaurantClientPage.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import type { AppDictionary } from "@/app/[lang]/dictionaries";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

interface SectionData {
  title: string;
  description: string;
  subsections?: Record<string, { title: string; description: string }>;
}

interface RestaurantClientPageProps {
  dict: AppDictionary;
}

// 1️⃣ Here’s the **exact** order of every top‐level section key
//     **Must** match your JSON keys under `restaurant.sections`
const RESTAURANT_SECTION_ORDER = [
  "culinary_philosophy",      // Philosophy
  "garden",                   // Garden
  "dining_experiences",       // Experiences
  "atmosphere",               // Atmosphere
  "chef_team",                // Team
  "community",                // Community
  "sustainability_commitment",// Sustainability
  "chef_garden_table",        // Chef’s Garden Table
  "local_artisans",           // Local Artisans
  "colibri_service",          // Colibrí Service Philosophy
] as const;

type SectionKey = typeof RESTAURANT_SECTION_ORDER[number];

export default function RestaurantClientPage({ dict }: RestaurantClientPageProps) {
  const controlsVideo   = useAnimation();
  const controlsContent = useAnimation();
  const videoRef        = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile]           = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  // ── MOBILE DETECTION ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── SHARED-ELEMENT TRANSITION ─────────────────────────────────────────────────
  useEffect(() => {
    const fromHomePage = sessionStorage.getItem("fromHomePage");
    const playbackTime = sessionStorage.getItem("fromHomePageTime");
    const targetVideo  = sessionStorage.getItem("targetVideo") || "/videos/restaurant.mp4";

    const run = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        videoRef.current.src         = targetVideo;
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play().catch(() => {});
        // wait for your hero-card grow animation
        await new Promise((r) => setTimeout(r, 1300));

        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        await controlsContent.start({ y: 0,       transition: { duration: 1, ease: "easeInOut" } });
      } else {
        // immediate skip
        await controlsVideo.start({ y: "-100vh", transition: { duration: 0 } });
        await controlsContent.start({ y: 0,       transition: { duration: 0 } });
      }

      sessionStorage.removeItem("fromHomePage");
      sessionStorage.removeItem("fromHomePageTime");
      sessionStorage.removeItem("targetVideo");
      setTransitionDone(true);
    };

    run();
  }, [controlsVideo, controlsContent]);

  if (!transitionDone) return null;

  // ── PICK UP ONLY THE KEYS THAT EXIST ────────────────────────────────────────────
  const sectionKeys = RESTAURANT_SECTION_ORDER.filter(
    (key) => key in dict.restaurant.sections
  ) as SectionKey[];

  // ── FLATTEN FOR MOBILE-SNAP & DOCK-LEFT NAV ────────────────────────────────────
  // [ "culinary_philosophy", ...its subsection IDs, "garden", ..., etc ]
  const sectionIds = sectionKeys.flatMap((key) => [
    key,
    ...(dict.restaurant.sections[key].subsections
      ? Object.keys(dict.restaurant.sections[key].subsections!)
      : []),
  ]);

  return (
    <>
      {/* Video overlay */}
      <motion.div
        initial={{ y: 0 }}
        animate={controlsVideo}
        className="fixed inset-0 flex justify-center overflow-hidden pointer-events-none z-[1000]"
        style={{ zIndex: transitionDone ? -1 : 1000 }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`object-cover ${
            isMobile ? "w-full h-full" : "w-[98vw] h-[98vh] rounded-3xl mt-[1vh]"
          }`}
        />
      </motion.div>

      {/* Page content */}
      <motion.div initial={{ y: "100vh" }} animate={controlsContent} className="relative">
        <header className="text-center py-12 px-6">
          <TypographyH1>{dict.restaurant.title}</TypographyH1>
          <TypographyP className="mt-2">{dict.restaurant.description}</TypographyP>
        </header>

        {sectionKeys.map((key) => {
          const sec = dict.restaurant.sections[key] as SectionData;
          return (
            <section
              key={key}
              id={key}
              className="main-section min-h-screen snap-start flex flex-col items-center justify-center px-6"
            >
              <div className="max-w-2xl text-center">
                <TypographyH2>{sec.title}</TypographyH2>
                <TypographyP className="mt-2">{sec.description}</TypographyP>
              </div>

              {/* every subsection becomes its own full‐screen block */}
              {sec.subsections &&
                Object.entries(sec.subsections).map(([subId, sub]) => (
                  <section
                    key={subId}
                    id={subId}
                    className="subsection min-h-screen snap-start flex flex-col items-center justify-center px-6"
                  >
                    <div className="max-w-2xl text-center">
                      <TypographyH3>{sub.title}</TypographyH3>
                      <TypographyP className="mt-2">{sub.description}</TypographyP>
                    </div>
                  </section>
                ))}
            </section>
          );
        })}
      </motion.div>

      {/* mobile snap‐tracker (and dock-left clicks use the same list) */}
      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}