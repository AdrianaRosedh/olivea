"use client";

import { motion } from "framer-motion";
import WowIntro from "@/components/animations/WowIntro";
import PageTransition from "@/components/animations/PageTransition";
import CinematicLink from "@/components/animations/CinematicLink";
import ReservationButton from "./ReservationButton";
import OliveaFTTLogo from "@/assets/oliveaFTT.svg";
import { EntranceCard } from "@/components/ui/EntranceCard";

export default function HomePage() {
  const sections = [
    { href: "/es/casa",       label: "Casa Olivea",         desc: "A home you can stay in." },
    { href: "/es/restaurant", label: "Olivea Farm To Table", desc: "A garden you can eat from." },
    { href: "/es/cafe",       label: "Olivea Café",          desc: "Wake up with flavor." },
  ];

  return (
    <>
      {/* Entry intro */}
      <WowIntro />

      {/* Fade‐in of the “frame” */}
      <PageTransition>
        <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[var(--olivea-cream)]">
          {/* video container */}
          <div
            className="relative overflow-hidden shadow-xl"
            style={{ width: "98vw", height: "98vh", borderRadius: "1.5rem" }}
          >
            <video
              id="home-video"
              className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]"
              src="/videos/homepage-temp.mp4"
              autoPlay muted loop playsInline preload="auto"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 rounded-[1.5rem]" />
          </div>

          {/* overlay content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <OliveaFTTLogo className="w-48 md:w-72 text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-4 text-[var(--olivea-cream)] font-sans tracking-wide text-base md:text-lg"
            >
              Experience the garden. Live the story.
            </motion.p>

            {/* desktop cards */}
            <div className="hidden md:flex gap-6 mt-10">
              {sections.map((sec) => (
                <CinematicLink key={sec.href} href={sec.href}>
                  <EntranceCard {...sec} />
                </CinematicLink>
              ))}
            </div>

            {/* mobile buttons */}
            <div className="flex flex-col md:hidden gap-4 mt-8">
              {sections.map((sec) => (
                <CinematicLink key={sec.href} href={sec.href}>
                  <button className="w-full h-28 flex flex-col items-center justify-center bg-[var(--olivea-cream)] bg-opacity-90 backdrop-blur-md text-[var(--olivea-ink)] rounded-lg shadow-md">
                    <span className="font-serif text-lg">{sec.label}</span>
                    <span className="font-sans text-sm mt-1">{sec.desc}</span>
                  </button>
                </CinematicLink>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-8"
            >
              <ReservationButton className="bg-[var(--olivea-olive)] text-white px-6 py-3 rounded-lg hover:bg-[var(--olivea-clay)]">
                Reservar
              </ReservationButton>
            </motion.div>
          </div>
        </main>
      </PageTransition>
    </>
  );
}