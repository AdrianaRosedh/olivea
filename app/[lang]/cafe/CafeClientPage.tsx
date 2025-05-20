"use client";

import { useEffect, useState, useRef } from "react";
import type { AppDictionary } from "@/app/[lang]/dictionaries";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  available: boolean;
  category?: string;
}

interface CafeClientPageProps {
  dict: AppDictionary;
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

  const staticIds = Object.keys(dict.cafe.sections) as Array<
    keyof typeof dict.cafe.sections
  >;
  const dynamicIds = Object.keys(itemsByCategory);
  const sectionIds = [...staticIds, ...dynamicIds];

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // MATCH CASA LOGIC EXACTLY
  useEffect(() => {
    const fromHomePage = sessionStorage.getItem("fromHomePage");
    const playbackTime = sessionStorage.getItem("fromHomePageTime");
    const targetVideo = sessionStorage.getItem("targetVideo") || "/videos/cafe.mp4";

    const animateSequence = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        // Set correct video dynamically
        videoRef.current.src = targetVideo;
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play().catch(() => {});

        // Wait briefly for shared overlay fade-out
        await new Promise((res) => setTimeout(res, 800));

        // Animate video out and content in
        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        await controlsContent.start({ y: 0, transition: { duration: 1, ease: "easeInOut" } });

        // Cleanup
        sessionStorage.removeItem("fromHomePage");
        sessionStorage.removeItem("fromHomePageTime");
        sessionStorage.removeItem("targetVideo");
      } else {
        // Direct load (no transition), skip animations
        await controlsVideo.start({ y: "-100vh", transition: { duration: 0 } });
        await controlsContent.start({ y: 0, transition: { duration: 0 } });
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
          src="/videos/cafe.mp4"
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
        className="relative"
      >
        {sectionIds.map((id) => {
          if (id in dict.cafe.sections) {
            const { title, description } =
              dict.cafe.sections[id as keyof typeof dict.cafe.sections];
            return (
              <section
                key={id}
                id={id}
                className="min-h-screen snap-start flex items-center justify-center px-6"
                aria-labelledby={`${id}-heading`}
              >
                <div id={`${id}-heading`} className="max-w-2xl text-center">
                  <TypographyH2>{title}</TypographyH2>
                  <TypographyP className="mt-2">{description}</TypographyP>
                </div>
              </section>
            );
          }

          const items = itemsByCategory[id]!;
          return (
            <section
              key={id}
              id={id}
              className="min-h-screen snap-start flex items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div id={`${id}-heading`} className="max-w-2xl text-center">
                <TypographyH2>{id}</TypographyH2>
                <div className="mt-4 space-y-3 text-left">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b py-2"
                    >
                      <span>{item.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </motion.div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}