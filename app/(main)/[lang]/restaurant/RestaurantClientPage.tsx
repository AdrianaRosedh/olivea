"use client";

import { useEffect, useState, useRef } from "react";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
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

  // 1️⃣ Mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 2️⃣ Shared-element transition logic (robust across browsers)
  useEffect(() => {
    const fromHomePage = sessionStorage.getItem("fromHomePage");
    const playbackTime = sessionStorage.getItem("fromHomePageTime");
    const stored = sessionStorage.getItem("targetVideo");
    const targetVideo = (stored || "/videos/restaurant.mp4").trim();

    const run = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        const vid = videoRef.current;

        // Compute WebM fallback
        const mp4 = targetVideo;
        const webm = mp4.replace(/\.mp4$/, ".webm");

        // Assign into <source> tags if present
        const sources = Array.from(vid.querySelectorAll("source"));
        if (sources[0] && sources[1]) {
          sources[0].src = webm;
          sources[1].src = mp4;
          vid.load();
        } else {
          // fallback to setting .src directly
          vid.src = mp4;
          vid.load();
        }

        // Wait for metadata (or 500ms max) so we can seek
        await Promise.race([
          new Promise<void>((res) => {
            if (vid.readyState >= HTMLMediaElement.HAVE_METADATA) {
              return res();
            }
            vid.addEventListener("loadedmetadata", () => res(), { once: true });
          }),
          new Promise<void>((res) => setTimeout(res, 500)),
        ]);

        // Seek to saved time
        vid.currentTime = parseFloat(playbackTime);

        // Play (some browsers need this user-initiated)
        await vid.play().catch(() => {});

        // Wait for the hero-card grow animation
        await new Promise((r) => setTimeout(r, 1300));

        // Animate video overlay out
        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        videoRef.current?.pause();
        // Animate content in
        await controlsContent.start({ y: 0, transition: { duration: 1, ease: "easeInOut" } });
      } else {
        // No transition: set positions immediately
        controlsVideo.set({ y: "-100vh" });
        controlsContent.set({ y: 0 });
      }

      // Clean up session storage and mark done
      sessionStorage.removeItem("fromHomePage");
      sessionStorage.removeItem("fromHomePageTime");
      sessionStorage.removeItem("targetVideo");
      setTransitionDone(true);
    };

    run();
  }, [controlsVideo, controlsContent]);

  // Filter and flatten sections for content and tracker
  const sectionKeys = RESTAURANT_SECTION_ORDER.filter(
    (key) => key in dict.restaurant.sections
  ) as SectionKey[];
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
        >
          {/* WebM first */}
          <source src="/videos/restaurant.webm" type="video/webm" />
          {/* MP4 fallback */}
          <source src="/videos/restaurant.mp4" type="video/mp4" />
          Your browser doesn’t support this video.
        </video>
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