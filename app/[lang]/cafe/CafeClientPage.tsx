"use client";

import { useEffect, useState, useRef } from "react";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  available: boolean;
  category?: string;
};

export type SectionDict = {
  title: string;
  description: string;
  error?: string;
};

interface CafeClientPageProps {
  dict: SectionDict;
  itemsByCategory: Record<string, MenuItem[]>;
}

export default function CafeClientPage({
  dict,
  itemsByCategory,
}: CafeClientPageProps) {
  const controlsVideo = useAnimation();
  const controlsContent = useAnimation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const sectionIds = ["about", ...Object.keys(itemsByCategory)];

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

        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        controlsContent.start({ y: 0, transition: { duration: 1, ease: "easeInOut" } });

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
          autoPlay muted loop playsInline
          className={`object-cover ${isMobile ? "w-full h-full" : "w-[98vw] h-[98vh] rounded-3xl mt-[1vh]"}`}
        />
      </motion.div>

      <motion.div initial={{ y: "100vh" }} animate={controlsContent} className="relative">
        <section id="about" className="min-h-screen snap-start flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <TypographyH2>{dict.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.description}</TypographyP>
          </div>
        </section>

        {Object.entries(itemsByCategory).map(([category, items]) => (
          <section key={category} id={category} className="min-h-screen snap-start flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
              <TypographyH2>{category}</TypographyH2>
              <div className="mt-4 space-y-3 text-left">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b py-2">
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </motion.div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}
