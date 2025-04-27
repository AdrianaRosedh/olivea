"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MagneticButton from "@/components/ui/MagneticButton"
import { useReservation } from "@/contexts/ReservationContext"

export default function HomePage() {
  const { openReservationModal } = useReservation()

  const handleReservationClick = () => {
    // Use the context to open the modal directly
    openReservationModal()
  }

  return (
    <main className="flex items-center justify-center w-full h-screen bg-black">
      <div className="relative w-full h-full max-w-screen-xl rounded-3xl overflow-hidden shadow-xl">
        {/* Background Video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/videos/homepage-temp.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Animated Gradient Overlay */}
        <motion.div
          initial={{ opacity: 0.4 }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent), linear-gradient(120deg, rgba(255,255,255,0.03), transparent 70%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Main Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center gap-y-8 md:gap-y-10 py-6 md:py-16">
          {/* Logo */}
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
            animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
            className="mt-10 md:mt-0"
          >
            {/* Simple text logo as a reliable fallback */}
            <h1 className="text-4xl md:text-6xl font-serif text-white tracking-widest">OLIVEA</h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-white text-sm md:text-base mt-2 font-sans"
          >
            Experience the garden. Live the story.
          </motion.p>

          {/* Identity Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.8,
                },
              },
            }}
            className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 mt-4"
          >
            {[
              { href: "/es/casa", label: "Casa Olivea", desc: "A home you can stay in." },
              { href: "/es/restaurant", label: "Olivea Farm To Table", desc: "A garden you can eat from." },
              { href: "/es/cafe", label: "Olivea Café", desc: "Wake up with flavor." },
            ].map(({ href, label, desc }) => (
              <motion.div
                key={label}
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full md:w-[240px]"
              >
                <Link href={href}>
                  <Button
                    size="lg"
                    className="group relative w-full h-[100px] text-lg px-6 py-4 flex flex-col items-center justify-center 
                      rounded-md bg-[var(--olivea-shell)] text-[var(--olivea-ink)] 
                      hover:bg-[var(--olivea-clay)] transition-colors overflow-hidden font-serif"
                  >
                    <span className="font-serif">{label}</span>
                    <span className="text-sm text-[color:var(--muted-foreground)] mt-1 font-sans">{desc}</span>
                    <span className="absolute left-[-50%] top-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Reservar Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 80, damping: 12 }}
            className="mt-6 md:mt-10 mb-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
              className="md:hidden w-full px-4"
            >
              <Button
                onClick={handleReservationClick}
                size="lg"
                className="w-full h-[60px] text-base rounded-xl bg-[var(--olivea-clay)] text-white 
                  hover:bg-[var(--olivea-clay)] transition-colors shadow-md font-sans"
              >
                Reservar
              </Button>
            </motion.div>

            <div className="hidden md:block">
              <MagneticButton
                onClick={handleReservationClick}
                className="px-6 py-3 text-white bg-[var(--olivea-olive)] hover:bg-[var(--olivea-clay)] rounded-md transition-colors font-sans"
              >
                Reservar
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
