"use client"

import type React from "react"

import { useEffect } from "react"
import { initNavigationEvents } from "@/lib/navigation-events"
import { useNavigationEvents } from "@/hooks/useNavigationEvents"
import NavigationAwareScrollInitializer from "./NavigationAwareScrollInitializer"

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Initialize the global navigation event system
  useEffect(() => {
    return initNavigationEvents()
  }, [])

  // Use the navigation events hook
  useNavigationEvents()

  return (
    <>
      <NavigationAwareScrollInitializer />
      {children}
    </>
  )
}
