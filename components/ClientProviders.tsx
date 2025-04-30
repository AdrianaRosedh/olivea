"use client"

import { useEffect, useState } from "react"
import ScrollManager from "@/components/ScrollManager"
import NavigationProvider from "@/components/NavigationProvider"
import MobileAudioFeedback from "@/components/ui/MobileAudioFeedback"
import AnimationInitializer from "@/components/AnimationInitializer"
import { useNavigationEvents } from "@/hooks/useNavigationEvents"

export default function ClientProviders() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Use the navigation events hook
  useNavigationEvents()

  useEffect(() => {
    setMounted(true)

    // Check if on mobile device
    const checkMobile = () => {
      if (typeof navigator !== "undefined") {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
        setIsMobile(isMobileDevice)
      }
    }

    checkMobile()
  }, [])

  if (!mounted) return null

  return (
    <>
      <NavigationProvider />
      <ScrollManager />
      <AnimationInitializer />
      {isMobile && <MobileAudioFeedback />}
    </>
  )
}
