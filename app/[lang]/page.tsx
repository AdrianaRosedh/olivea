'use client'

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setShowLoader(false), 3000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <main className="flex items-center justify-center w-full h-screen bg-black">
      <div className="relative w-full h-full max-w-screen-xl rounded-3xl overflow-hidden shadow-xl">
        
        {/* Loader */}
        <AnimatePresence>
          {showLoader && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 10, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-green-600 rounded-3xl"
            >
              <motion.h1
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-3xl md:text-5xl font-light tracking-tight text-white"
              >
                Olivea
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="https://www.w3schools.com/howto/rain.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Overlay content */}
        {!showLoader && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Image
                src="/images/logos/oliveaFTT.svg"
                alt="Olivea Logo"
                width={240}
                height={120}
                priority
                className="mx-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/es/restaurant">
                <Button variant="secondary" size="lg">
                  Olivea Farm To Table
                </Button>
              </Link>
              <Link href="/es/casa">
                <Button variant="ghost" size="lg">
                  Casa Olivea
                </Button>
              </Link>
              <Link href="/es/cafe">
                <Button variant="ghost" size="lg">
                  Olivea Café
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <Link href="/es/reservations">
                <Button className="mt-4" size="lg">
                  Reservar
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}