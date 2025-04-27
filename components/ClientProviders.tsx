"use client"

import { Suspense, useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import components with no SSR
const ScrollManager = dynamic(() => import("@/components/ScrollManager"), { ssr: false })
const NavigationProvider = dynamic(() => import("@/components/NavigationProvider"), { ssr: false })

export default function ClientProviders() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Suspense fallback={null}>
      <NavigationProvider />
      <ScrollManager />
    </Suspense>
  )
}
