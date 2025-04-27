"use client"

import type React from "react"

import { useEffect } from "react"
import { initNavigationEvents, emitEvent, EVENTS } from "@/lib/navigation-events"
import { useNavigationEvents } from "@/hooks/useNavigationEvents"
import NavigationAwareScrollInitializer from "./NavigationAwareScrollInitializer"
import { usePathname } from "next/navigation"

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Initialize the global navigation event system
  useEffect(() => {
    return initNavigationEvents()
  }, [])

  // Use the navigation events hook
  useNavigationEvents()

  // Emit navigation events when pathname changes
  useEffect(() => {
    if (typeof window === "undefined") return

    console.log(`[NavigationProvider] Path changed: ${pathname}`)

    // Emit navigation complete event
    emitEvent(EVENTS.NAVIGATION_COMPLETE)

    // Trigger scroll initialization after navigation
    setTimeout(() => {
      emitEvent(EVENTS.SCROLL_INITIALIZE)
    }, 100)
  }, [pathname])

  return (
    <>
      <NavigationAwareScrollInitializer />
      {children}
    </>
  )
}
