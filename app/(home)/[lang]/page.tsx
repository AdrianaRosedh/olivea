"use client";

import { useEffect, useState, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import { AnimatePresence, motion, useAnimation, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import ReservationButton from "@components/ui/ReservationButton";
import type { VideoKey } from "@/contexts/SharedTransitionContext";
import CasaLogo from "@/assets/alebrije-2.svg";
import FarmLogo from "@/assets/alebrije-1-Green.svg";
import CafeLogo from "@/assets/alebrije-3.svg";
import OliveaLogo from "@/assets/alebrije-1.svg";
import InlineEntranceCard from "@/components/ui/InlineEntranceCard";

const AnimatedDesktopLoader = () => {
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let start: number | null = null;
    const duration = isMobile ? 1800 : 3500; // Shorter duration on mobile

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progressTime = timestamp - start;
      const percent = Math.min((progressTime / duration) * 100, 100);
      setProgress(Math.floor(percent));
      if (progressTime < duration) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isMobile]);

  // Allow skipping loader by clicking anywhere
  const handleSkip = () => setProgress(100);

  return (
    <div
      className="absolute bottom-20 left-12 right-12 hidden md:flex items-center text-[#e2be8f] text-xl font-semibold pointer-events-auto"
      onClick={handleSkip}
      style={{ cursor: "pointer" }}
    >
      <span>Donde El Corazón es el Huerto</span>
      <div className="flex-1 h-2 rounded-full mx-6 relative" style={{ backgroundColor: "#e2be8f20" }}>
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-[#e2be8f]"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: isMobile ? 1.8 : 3.5, ease: "linear" }}
        />
      </div>
      <span>{progress}%</span>
    </div>
  );
};


const AlebrijeDraw = dynamic(() => import("@/components/animations/AlebrijeDraw"), { ssr: false });

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.3, staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HomePage() {
  const overlayControls = useAnimation();
  const logoControls = useAnimation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const logoTargetRef = useRef<HTMLDivElement>(null);

  const [drawComplete, setDrawComplete] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [revealMain, setRevealMain] = useState(false);
  const [isMobileMain, setIsMobileMain] = useState(false);

  const sections: Array<{
    href: string;
    title: string;
    description: string;
    Logo: ComponentType<SVGProps<SVGSVGElement>>;
    videoKey: VideoKey;
  }> = [
    { href: "/es/casa",       title: "Casa Olivea",         description: "A home you can stay in.",    Logo: CasaLogo,    videoKey: "casa" },
    { href: "/es/farmtotable",title: "Olivea Farm To Table", description: "A garden you can eat from.", Logo: FarmLogo,    videoKey: "farmtotable" },
    { href: "/es/cafe",       title: "Olivea Café",          description: "Wake up with flavor.",        Logo: CafeLogo,    videoKey: "cafe" },
  ];


  const mobileSections = isMobileMain
    ? [sections[1], sections[0], sections[2]]
    : sections;

  useEffect(() => {
    const resizeHandler = () => setIsMobileMain(window.innerWidth < 768);
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
  // Lock the body scroll during the intro
  document.body.classList.add("overflow-hidden");

  let isCancelled = false;

  const handleInitialAnimation = async () => {
    try {
      // 1️⃣ Wait your fixed intro delay
      await new Promise((res) => setTimeout(res, 1500));
      if (isCancelled) return;
      setDrawComplete(true);

      const vid = videoRef.current;
      const logoTarget = logoTargetRef.current;
      if (!vid || !logoTarget) return;

      // 2️⃣ Race loadedmetadata against a 1s timeout so we never wait forever
      await Promise.race([
        new Promise<void>((res) => {
          if (vid.readyState >= HTMLMediaElement.HAVE_METADATA) {
            // metadata already loaded
            return res();
          }
          vid.addEventListener("loadedmetadata", () => res(), { once: true });
        }),
        new Promise<void>((res) => setTimeout(res, 1000)),
      ]);
      if (isCancelled) return;

      // 3️⃣ Reveal the main content
      setRevealMain(true);

      // 4️⃣ Animate the overlay from the video's current position
      const rect = vid.getBoundingClientRect();
      await overlayControls.start({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        borderRadius: "1.5rem",
        transition: { duration: 0.8, ease: "easeInOut" },
      });
      if (isCancelled) return;

      // 5️⃣ Brief pause before the logo animation
      await new Promise((res) => setTimeout(res, 400));
      if (isCancelled) return;

      // 6️⃣ Animate the logo into place
      const pad = logoTarget.getBoundingClientRect();
      await logoControls.start({
        top: pad.top + pad.height / 2 + window.scrollY,
        left: pad.left + pad.width / 2 + window.scrollX,
        x: "-50%",
        y: "-50%",
        scale: pad.width / 240,
        transition: { type: "spring", stiffness: 200, damping: 25 },
      });
      if (isCancelled) return;

      // 7️⃣ Fade out the overlay
      await overlayControls.start({
        opacity: 0,
        transition: { duration: 0.4 },
      });
    } catch (err) {
      console.error("Intro animation error:", err);
    } finally {
      // 8️⃣ Always remove loader and restore scroll
      if (!isCancelled) {
        setShowLoader(false);
        document.body.classList.remove("overflow-hidden");
      }
    }
  };

  handleInitialAnimation();

  return () => {
    // signal to cancel any in-flight animation steps
    isCancelled = true;
  };
}, [overlayControls, logoControls]);

  return (
    <>
      {/* Loader Overlay */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="overlay"
            initial={{ opacity: 1 }}
            animate={overlayControls}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "var(--olivea-olive)", zIndex: 50 }}
          >
            {/* Mobile Loader */}
            <div className="absolute inset-0 md:hidden flex items-center justify-start pl-4 py-6 pointer-events-none">
              <div className="relative w-2 h-2/3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-full bg-[#e2be8f] rounded-full"
                  style={{ transformOrigin: "bottom center" }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </div>
            </div>
        
            {/* Desktop Loader */}
            <AnimatedDesktopLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AlebrijeDraw Animation */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="logo"
            initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
            animate={logoControls}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{
              position: "fixed",
              zIndex: 100,
              width: 240,
              height: 240,
              transformOrigin: "center center",
            }}
          >
            <AlebrijeDraw
              size={240}
              strokeDuration={drawComplete ? 0 : 5}
              fillDuration={drawComplete ? 0 : 7}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`fixed inset-0 flex flex-col items-center justify-start md:justify-center bg-[var(--olivea-cream)] transition-opacity duration-500 ${revealMain ? "opacity-100" : "opacity-0"}`}>
        {/* Background video hero */}
        <div
          className="relative overflow-hidden shadow-xl mt-1 md:mt-0 "
          style={{
            width: "98vw",
            height: isMobileMain ? "30vh" : "98vh",
            borderRadius: "1.5rem",
                }}
        >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload={isMobile ? "metadata" : "metadata"}
          poster="/images/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]"
        >
          <source src="/videos/homepage-temp.webm" type="video/webm" />
          <source src="/videos/homepage-temp.mp4" type="video/mp4" />
          Your browser doesn’t support this video.
        </video>


          <div className="absolute inset-0 flex justify-center items-start">
            <div
              ref={logoTargetRef}
              className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56"
            >
              <OliveaLogo className="hidden md:block w-full h-full" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 rounded-[1.5rem]" />
        </div>
        
        {/* Mobile cards + button */}
        <motion.div
          className="flex flex-col md:hidden flex-1 w-full px-4 pt-4"
          variants={containerVariants}
          initial="hidden"
          animate={!showLoader ? "show" : "hidden"}
        >
          <div className="space-y-12">
            {/* Mobile sections */}
              {mobileSections.map((sec) => (
                <motion.div key={sec.href} variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                  <InlineEntranceCard
                    title={sec.title}
                    href={sec.href}
                    videoKey={sec.videoKey}            /* ← don’t forget this! */
                    description={sec.description}
                    Logo={sec.Logo}
                    onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                  />
                </motion.div>
              ))}

          </div>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-auto w-full pb-6"
          >
            <ReservationButton />
          </motion.div>
        </motion.div>
          
        {/* Desktop cards + button */}
        <motion.div
          className="hidden md:flex absolute inset-0 z-40 flex-col items-center justify-center px-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={!showLoader ? "show" : "hidden"}
        >
          <div className="flex gap-6 md:pt-16 mb-0">
            {/* Desktop sections */}
            {sections.map((sec) => (
              <motion.div key={sec.href} variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                <InlineEntranceCard
                  title={sec.title}
                  href={sec.href}
                  videoKey={sec.videoKey}            /* ← and this! */
                  description={sec.description}
                  Logo={sec.Logo}
                  onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                />
              </motion.div>
            ))}

          </div>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + sections.length * 0.2 }}
            className="mt-8 md:mt-15"
          >
            <ReservationButton />
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}