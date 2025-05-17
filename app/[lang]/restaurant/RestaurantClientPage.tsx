// app/[lang]/restaurant/RestaurantClientPage.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

export interface SubsectionDict {
  title: string;
  description: string;
}

export interface SectionDict {
  title: string;
  description: string;
  subsections?: Record<string, SubsectionDict>;
}

export interface RestaurantClientPageProps {
  lang: "en" | "es";
  dict: {
    title: string;
    description: string;
    sections: Record<string, SectionDict>;
  };
}

export default function RestaurantClientPage({
  lang,
  dict,
}: RestaurantClientPageProps) {
  const controlsVideo = useAnimation();
  const controlsContent = useAnimation();
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // shared‐element video animation (EXACT CASA LOGIC)
  useEffect(() => {
    const fromHomePage = sessionStorage.getItem("fromHomePage");
    const playbackTime = sessionStorage.getItem("fromHomePageTime");

    const animateSequence = async () => {
      if (fromHomePage && playbackTime && videoRef.current) {
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play().catch(() => {});
        await new Promise((r) => setTimeout(r, 800));

        await controlsVideo.start({
          y: "-100vh",
          transition: { duration: 1, ease: "easeInOut" },
        });
        await controlsContent.start({
          y: 0,
          transition: { duration: 1, ease: "easeInOut" },
        });

        sessionStorage.removeItem("fromHomePage");
        sessionStorage.removeItem("fromHomePageTime");
      } else {
        await controlsVideo.start({ y: "-100vh", transition: { duration: 0 } });
        await controlsContent.start({ y: 0, transition: { duration: 0 } });
      }      
    };

    animateSequence();
  }, [controlsVideo, controlsContent]);

  const sectionKeys = Object.keys(dict.sections);
  const sectionIds = sectionKeys.flatMap((secId) => {
    const subs = dict.sections[secId].subsections;
    return subs ? [secId, ...Object.keys(subs)] : [secId];
  });

  return (
    <>
      <motion.div
        initial={{ y: 0 }}
        animate={controlsVideo}
        className="fixed inset-0 flex justify-center overflow-hidden z-[1000]"
      >
        <video
          ref={videoRef}
          src="/videos/homepage-temp.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={`object-cover ${
            isMobile ? "w-full h-full" : "w-[98vw] h-[98vh] rounded-3xl mt-[1vh]"
          }`}
        />
      </motion.div>

      <motion.div
        initial={{ y: "100vh" }}
        animate={controlsContent}
        lang={lang}
        className="relative"
      >
        <header className="text-center py-12 px-6">
          <TypographyH1>{dict.title}</TypographyH1>
          <TypographyP className="mt-2">{dict.description}</TypographyP>
        </header>

        {sectionKeys.map((secId) => {
          const info = dict.sections[secId];
          return (
            <section
              key={secId}
              id={secId}
              data-section-id={secId}
              className="min-h-screen snap-start flex flex-col items-center justify-center px-6"
              aria-labelledby={`${secId}-heading`}
            >
              <div className="max-w-2xl text-center">
                <TypographyH2 id={`${secId}-heading`}>{info.title}</TypographyH2>
                <TypographyP className="mt-2">{info.description}</TypographyP>

                {info.subsections && (
                  <div className="mt-6 space-y-4 text-left">
                    {Object.entries(info.subsections).map(([subId, sub]) => (
                      <div key={subId} id={subId}>
                        <TypographyH3>{sub.title}</TypographyH3>
                        <TypographyP className="mt-1">{sub.description}</TypographyP>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </motion.div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}