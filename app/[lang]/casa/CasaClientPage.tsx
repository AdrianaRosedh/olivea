"use client";

import { useEffect, useState, useRef } from "react";
import type { AppDictionary } from "../dictionaries";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

const SECTION_IDS = ["rooms", "breakfast", "experiences", "location"] as const;

interface CasaClientPageProps {
  dict: AppDictionary;
}

export default function CasaClientPage({ dict }: CasaClientPageProps) {
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

        await new Promise((res) => setTimeout(res, 800)); // Shorter pause for seamlessness

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

      <motion.div initial={{ y: "100vh" }} animate={controlsContent} className="relative">
        {SECTION_IDS.map((id) => (
          <section
            key={id}
            id={id}
            data-section-id={id}
            className="min-h-screen w-full flex items-center justify-center px-6 snap-start"
            aria-labelledby={`${id}-heading`}
          >
            <div id={`${id}-heading`} className="max-w-2xl text-center">
              <TypographyH2>{dict.casa.sections[id].title}</TypographyH2>
              <TypographyP className="mt-2">{dict.casa.sections[id].description}</TypographyP>
            </div>
          </section>
        ))}
      </motion.div>

      <MobileSectionTracker sectionIds={SECTION_IDS as readonly string[]} />
    </>
  );
}
