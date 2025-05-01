"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import ReservationButton from "./ReservationButton"
import OliveaFTTLogo from "@/assets/oliveaFTT.svg"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[var(--olivea-cream)]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden shadow-xl"
        style={{
          width: "98vw",
          height: "98vh",
          borderRadius: "1.5rem",
        }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            maskImage: "radial-gradient(white 100%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(white 100%, transparent 100%)",
            borderRadius: "1.5rem",
          }}
          src="/videos/homepage-temp.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 pointer-events-none" style={{ borderRadius: "1.5rem" }} />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <OliveaFTTLogo className="w-48 md:w-72 mx-auto text-white" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-4 text-[var(--olivea-cream)] font-sans tracking-wide text-base md:text-lg"
          >
            Experience the garden. Live the story.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2, delayChildren: 1 } } }}
            className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8"
          >
            {[
              { href: "/es/casa", label: "Casa Olivea", desc: "A home you can stay in." },
              { href: "/es/restaurant", label: "Olivea Farm To Table", desc: "A garden you can eat from." },
              { href: "/es/cafe", label: "Olivea Café", desc: "Wake up with flavor." },
            ].map(({ href, label, desc }) => (
              <motion.div
                key={href}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.8 }}
              >
                <Link href={href}>
                  <Button className="w-64 h-32 flex flex-col items-center justify-center bg-[var(--olivea-cream)] bg-opacity-90 backdrop-blur-md text-[var(--olivea-ink)] rounded-lg shadow-md hover:scale-105 transition-transform">
                    <span className="font-serif text-lg">{label}</span>
                    <span className="font-sans text-sm mt-1">{desc}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-8"
          >
            <ReservationButton className="bg-[var(--olivea-olive)] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg shadow-md hover:bg-[var(--olivea-clay)] transition-colors" />
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}