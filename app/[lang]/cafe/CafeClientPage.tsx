"use client";

import { useEffect, useState, useRef } from "react";
import type { AppDictionary } from "@/app/[lang]/dictionaries";
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

interface SectionData {
  title: string;
  description: string;
  images?: { src: string; alt?: string }[];
  subsections?: Record<string, { title: string; description: string }>;
}

interface CafeClientPageProps {
  dict: AppDictionary;
}

const CAFÉ_SECTION_ORDER = [
  "all_day",    // 01 Experiences
  "padel",      // 02 Padel
  "menu",       // 03 Garden-Inspired
  "community",  // 04 Community
  "ambience",   // 05 Atmosphere
] as const;

export default function CafeClientPage({ dict }: CafeClientPageProps) {
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
    const targetVideo = sessionStorage.getItem("targetVideo") || "/videos/cafe.mp4";

    const run = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        videoRef.current.src = targetVideo;
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play().catch(() => {});
        // wait for the card-grow animation
        await new Promise((r) => setTimeout(r, 1_300));

        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        await controlsContent.start({ y: 0, transition: { duration: 1, ease: "easeInOut" } });
      } else {
        // no transition: set positions immediately
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

  // Build ordered section keys and flattened IDs
  const sectionKeys = CAFÉ_SECTION_ORDER.filter((key) =>
    key in dict.cafe.sections
  ) as Array<keyof typeof dict.cafe.sections>;

  const sectionIds = sectionKeys.flatMap((key) => [
    key,
    ...(dict.cafe.sections[key].subsections
      ? Object.keys(dict.cafe.sections[key].subsections!)
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

      {/* Page content only after transition */}
      {transitionDone && (
        <>
          <motion.div
            initial={{ y: "100vh" }}
            animate={controlsContent}
            className="relative"
          >
            {sectionKeys.map((key) => {
              const sec = dict.cafe.sections[key] as SectionData;
              const images = sec.images?.length
                ? sec.images
                : [{ src: "/images/hero.jpg", alt: sec.title }];

              return (
                <section
                  key={key}
                  id={key}
                  className="main-section min-h-screen flex flex-col items-center justify-center px-6"
                >
                  <div className="max-w-2xl text-center">
                    <TypographyH2>{sec.title}</TypographyH2>
                    <TypographyP className="mt-2">{sec.description}</TypographyP>
                  </div>

                  {/* Optional image grid */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {images.map((img, idx) => (
                      <div key={idx} className="bg-white shadow rounded overflow-hidden">
                        <Image
                          src={img.src}
                          alt={img.alt || ""}
                          width={800}
                          height={480}
                          className="object-cover w-full h-48"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Sub-sections */}
                  {sec.subsections &&
                    Object.entries(sec.subsections).map(([subId, sub]) => (
                      <section
                        key={subId}
                        id={subId}
                        className="subsection min-h-screen flex flex-col items-center justify-center px-6"
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
