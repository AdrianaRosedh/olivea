"use client";

import { useEffect, useState, useRef } from "react";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

const ALL_SECTIONS = ["story", "garden", "menu", "wines"] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];

export interface SectionDict {
  title: string;
  description: string;
}

export interface RestaurantClientPageProps {
  lang: "en" | "es";
  dict: {
    title: string;
    description: string;
    sections: Record<SectionKey, SectionDict>;
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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fromHomePage = sessionStorage.getItem("fromHomePage");
    const playbackTime = sessionStorage.getItem("fromHomePageTime");

    const animateSequence = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play();

        await new Promise((res) => setTimeout(res, 800));

        await controlsVideo.start({
          y: "-100vh",
          transition: { duration: 1, ease: "easeInOut" },
        });

        controlsContent.start({
          y: 0,
          transition: { duration: 1, ease: "easeInOut" },
        });

        sessionStorage.removeItem("fromHomePage");
        sessionStorage.removeItem("fromHomePageTime");
        sessionStorage.removeItem("targetVideo");
      } else {
        controlsVideo.set({ y: "-100vh" });
        controlsContent.set({ y: 0 });
      }
    };

    animateSequence();
  }, [controlsVideo, controlsContent]);

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
        {/* PAGE HEADER */}
        <header className="text-center py-12 px-6">
          <TypographyH1>{dict.title}</TypographyH1>
          <TypographyP className="mt-2">{dict.description}</TypographyP>
        </header>

        {/* SECTIONS */}
        {ALL_SECTIONS.map((id) => {
          const info = dict.sections[id];
          return (
            <section
              key={id}
              id={id}
              data-section-id={id}
              className="min-h-screen snap-start flex flex-col items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div className="max-w-2xl text-center">
                <TypographyH2 id={`${id}-heading`}>
                  {info.title}
                </TypographyH2>
                <TypographyP className="mt-2">
                  {info.description}
                </TypographyP>
              </div>
            </section>
          );
        })}
      </motion.div>

      <MobileSectionTracker sectionIds={[...ALL_SECTIONS]} />
    </>
  );
}
