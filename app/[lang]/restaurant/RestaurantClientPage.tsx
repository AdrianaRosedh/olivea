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

const RESTAURANT_SECTION_ORDER = [
  "culinary_philosophy",
  "garden",
  "dining_experiences",
  "atmosphere",
  "chef_team",
  "community",
  "sustainability_commitment",
  "chef_garden_table",
  "local_artisans",
  "colibri_service",
] as const;

type SectionKey = typeof RESTAURANT_SECTION_ORDER[number];

export default function RestaurantClientPage({ dict }: RestaurantClientPageProps) {
  const controlsVideo = useAnimation();
  const controlsContent = useAnimation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  // Mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Shared-element transition logic
  useEffect(() => {
    const fromHomePage = sessionStorage.getItem("fromHomePage");
    const playbackTime = sessionStorage.getItem("fromHomePageTime");
    const targetVideo = sessionStorage.getItem("targetVideo") || "/videos/restaurant.mp4";

    const run = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        videoRef.current.src = targetVideo;
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play().catch(() => {});
        // wait for the hero-card grow animation
        await new Promise((r) => setTimeout(r, 1300));
        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        await controlsContent.start({ y: 0, transition: { duration: 1, ease: "easeInOut" } });
      } else {
        // immediately position off-screen / content
        controlsVideo.set({ y: "-100vh" });
        controlsContent.set({ y: 0 });
      }   

      sessionStorage.removeItem("fromHomePage");
      sessionStorage.removeItem("fromHomePageTime");
      sessionStorage.removeItem("targetVideo");
      setTransitionDone(true);
    };

    run();
  }, [controlsVideo, controlsContent]);

  // Filter only existing sections in JSON order
  const sectionKeys = RESTAURANT_SECTION_ORDER.filter(
    (key) => key in dict.restaurant.sections
  ) as SectionKey[];

  // Flatten for mobile snap-tracker
  const sectionIds = sectionKeys.flatMap((key) => [
    key,
    ...(dict.restaurant.sections[key].subsections
      ? Object.keys(dict.restaurant.sections[key].subsections!)
      : []),
  ]);

  return (
    <>
      {/* Video overlay always mounts */}
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

      {/* Page content after video transition */}
      {transitionDone && (
        <>
          <motion.div
            initial={{ y: "100vh" }}
            animate={controlsContent}
            className="relative"
          >
            <header className="text-center py-12 px-6">
              <TypographyH1>{dict.restaurant.title}</TypographyH1>
              <TypographyP className="mt-2">
                {dict.restaurant.description}
              </TypographyP>
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

                  {/* Sub-sections */}
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

          <MobileSectionTracker sectionIds={sectionIds} />
        </>
      )}
    </>
  );
}