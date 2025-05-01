"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import FlyingAlebrije from "./FlyingAlebrije"
import Logo1 from "@/assets/alebrije-1.svg"
import Logo2 from "@/assets/alebrije-2.svg"
import Logo3 from "@/assets/alebrije-3.svg"
import Logo4 from "@/assets/alebrije-4.svg"

export default function WowIntro() {
  const controls = useAnimation()
  const [phase, setPhase] = useState<"intro" | "shrink" | "done">("intro")

  // **Lock body scroll while intro is visible**
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // after 3s, move to shrink
  useEffect(() => {
    const t = setTimeout(() => setPhase("shrink"), 3000)
    return () => clearTimeout(t)
  }, [])

  // shrink into your <video id="home-video" />
  useEffect(() => {
    if (phase !== "shrink") return
    const video = document.getElementById("home-video")
    if (!video) return console.warn("WowIntro: #home-video not found")
    const r = video.getBoundingClientRect()

    controls
      .start({
        top:   r.top + "px",
        left:  r.left + "px",
        width:  r.width + "px",
        height: r.height + "px",
        borderRadius: "1.5rem",
        transition: { duration: 0.8, ease: "easeInOut" },
      })
      .then(() =>
        controls.start({
          opacity: 0,
          transition: { duration: 0.5, ease: "easeInOut", delay: 0.2 },
        })
      )
      .then(() => setPhase("done"))
  }, [phase, controls])

  if (phase === "done") return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 overflow-hidden bg-[var(--olivea-ink)] z-[9999]"
        initial={{
          top:   0,
          left:  0,
          width: "100vw",
          height:"100vh",
          borderRadius: 0,
          opacity: 1,
        }}
        animate={controls}
      >
        {phase === "intro" && (
          <FlyingAlebrije
            size={120}
            icons={[
              <Logo1 key="1" className="w-full h-full fill-[var(--olivea-cream)]" />,
              <Logo2 key="2" className="w-full h-full fill-[var(--olivea-cream)]" />,
              <Logo3 key="3" className="w-full h-full fill-[var(--olivea-cream)]" />,
              <Logo4 key="4" className="w-full h-full fill-[var(--olivea-cream)]" />,
            ]}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}