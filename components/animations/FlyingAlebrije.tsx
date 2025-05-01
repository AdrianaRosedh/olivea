// components/animations/FlyingAlebrije.tsx
"use client"

import { ReactNode, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"

interface Props {
  icons: ReactNode[]
  radius?: number   // how far from center to spread them
  size?: number     // icon size in px
}

export default function FlyingAlebrije({
  icons,
  radius = 120,
  size = 100,
}: Props) {
  // one animation controller per icon
  const controlsArray = icons.map(() => useAnimation())

  useEffect(() => {
    icons.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / icons.length
      const baseX = Math.cos(angle) * radius
      const baseY = Math.sin(angle) * radius

      // 1) “Take off” — from center out to base position
      // 2) Then float endlessly around that base
      controlsArray[i].start([
        {
          x: 0,
          y: 0,
          opacity: 0,
        },
        {
          x: baseX,
          y: baseY,
          opacity: 1,
          transition: { delay: i * 0.3, duration: 1, ease: "easeOut" },
        },
        // now enter float loop
        {
          x: [baseX, baseX + 10, baseX, baseX - 10, baseX],
          y: [baseY, baseY - 10, baseY, baseY + 10, baseY],
          transition: {
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          },
        },
      ])
    })
  }, [icons, controlsArray, radius])

  return (
    <div className="relative w-full h-full">
      {icons.map((Icon, i) => (
        <motion.div
          key={i}
          animate={controlsArray[i]}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: size,
            height: size,
            marginTop: -size / 2,
            marginLeft: -size / 2,
          }}
        >
          {Icon}
        </motion.div>
      ))}
    </div>
  )
}