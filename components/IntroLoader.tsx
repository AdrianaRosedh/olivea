'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroLoader() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), 4000) // 4s splash
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[999] bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <video
            src="https://www.w3schools.com/howto/rain.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}