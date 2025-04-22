'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex items-center justify-center w-full h-screen bg-black">
      <div className="relative w-full h-full max-w-screen-xl rounded-3xl overflow-hidden shadow-xl">

        {/* Loader */}
        <AnimatePresence>
          {showLoader && (
            <motion.div
              key="loader"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 10, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-green-600 rounded-3xl"
            >
              <motion.h1
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-4xl md:text-6xl font-light tracking-tight text-white"
              >
                Olivea
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="https://www.w3schools.com/howto/rain.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Main Content */}
        {!showLoader && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center gap-y-8 md:gap-y-10 py-6 md:py-16">

            {/* Logo (a bit higher on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10 md:mt-0"
            >
              <Image
                src="/images/logos/oliveaFTT.svg"
                alt="Olivea Logo"
                width={240}
                height={120}
                priority
                className="mx-auto w-40 md:w-[240px]"
              />
            </motion.div>

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
                { href: '/es/restaurant', label: 'Olivea Farm To Table', desc: 'A garden you can eat from.' },
                { href: '/es/casa', label: 'Casa Olivea', desc: 'A home you can stay in.' },
                { href: '/es/cafe', label: 'Olivea Café', desc: 'Wake up with flavor.' },
              ].map(({ href, label, desc }) => (
                <motion.div
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="w-full md:w-[240px]"
                >
                  <Link href={href}>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full h-[100px] text-lg px-6 py-4 flex flex-col items-center justify-center"
                    >
                      <span>{label}</span>
                      <span className="text-sm text-muted-foreground mt-1">{desc}</span>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Reservar Button (spaced cleanly) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="mt-6 md:mt-10 mb-10"
            >
              <Link href="/es/reservations">
                <Button className="w-full md:w-auto" size="lg">
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