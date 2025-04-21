import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import VideoSection from "./VideoSection"

export default function LandingIntro() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            initial={{ width: 100, height: 100 }}
            animate={{ width: "90%", height: "90%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="bg-green-700 rounded-3xl"
          />
        ) : (
          <motion.div
            className="w-full max-w-[1440px] h-full rounded-3xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <VideoSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}