// app/[lang]/casa/CasaClientPage.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import type { AppDictionary } from "../dictionaries";
import Image from "next/image";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, useAnimation } from "framer-motion";

const SECTION_IDS = ["rooms", "mornings", "experiences", "ambience"] as const;
type SectionId = typeof SECTION_IDS[number];

interface SectionData {
  title: string;
  description: string;
  images?: { src: string; alt?: string }[];
  subsections?: Record<string, { title: string; description: string }>;
}

interface CasaClientPageProps {
  dict: AppDictionary;
}

export default function CasaClientPage({ dict }: CasaClientPageProps) {
  const controlsVideo   = useAnimation();
  const controlsContent = useAnimation();
  const videoRef        = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // “Clicked from homepage” video transition
  useEffect(() => {
    const fromHomePage  = sessionStorage.getItem("fromHomePage");
    const playbackTime  = sessionStorage.getItem("fromHomePageTime");
    const animateSequence = async () => {
      if (fromHomePage && videoRef.current && playbackTime) {
        videoRef.current.currentTime = parseFloat(playbackTime);
        await videoRef.current.play().catch(() => {});
        await new Promise((r) => setTimeout(r, 800));
        await controlsVideo.start({ y: "-100vh", transition: { duration: 1, ease: "easeInOut" } });
        await controlsContent.start({ y: 0, transition: { duration: 1, ease: "easeInOut" } });
        sessionStorage.removeItem("fromHomePage");
        sessionStorage.removeItem("fromHomePageTime");
      } else {
        controlsVideo.set({ y: "-100vh" });
        controlsContent.set({ y: 0 });
      }
    };
    animateSequence();
  }, [controlsVideo, controlsContent]);

  return (
    <>
      {/* Video overlay */}
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

      {/* Page content */}
      <motion.div initial={{ y: "100vh" }} animate={controlsContent} className="relative">
        {SECTION_IDS.map((id) => {
          const raw     = dict.casa.sections[id as SectionId];
          const section = raw as SectionData;

          // fallback image
          const images = section.images && section.images.length
            ? section.images
            : [{ src: "/images/hero.jpg", alt: section.title }];

          return (
            <section
              key={id}
              id={id}
              className="main-section min-h-screen flex flex-col items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div id={`${id}-heading`} className="max-w-2xl text-center">
                <TypographyH2>{section.title}</TypographyH2>
                <TypographyP className="mt-2">{section.description}</TypographyP>
              </div>

              {/* image grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {images.map((img, idx) => (
                  <div key={idx} className="bg-white shadow rounded overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt || ""}
                      width={800}       // or whatever max layout width
                      height={480}      // adjust to match your desired aspect
                      className="object-cover w-full h-48"
                    />
                  </div>
                ))}
              </div>

              {/* subsections */}
              {section.subsections &&
                Object.entries(section.subsections).map(([subId, sub]) => (
                  <section
                    key={subId}
                    id={subId}
                    className="subsection min-h-screen flex flex-col items-start justify-center px-6"
                    aria-labelledby={`${subId}-heading`}
                  >
                    <h4 id={`${subId}-heading`} className="text-2xl font-semibold mb-2">{sub.title}</h4>
                    <TypographyP>{sub.description}</TypographyP>
                    {/* subsection image */}
                    <div className="mt-4 bg-white shadow rounded overflow-hidden w-full sm:w-1/2 lg:w-1/3">
                       <Image
                         src="/images/hero.jpg"
                         alt={sub.title}
                         width={800}
                         height={480}
                         className="object-cover w-full h-48"
                      />
                    </div>
                  </section>
                ))}
            </section>
          );
        })}
      </motion.div>

      {/* Mobile nav */}
      <MobileSectionTracker sectionIds={SECTION_IDS as readonly string[]} />
    </>
  );
}
