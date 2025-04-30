"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

type NavigationContextType = {
  activeSection: string | null
  setActiveSection: (id: string) => void
  isManualNavigation: boolean
  setIsManualNavigation: (isManual: boolean) => void
  navigateToSection: (sectionId: string) => void
}

const NavigationContext = createContext<NavigationContextType>({
  activeSection: null,
  setActiveSection: () => {},
  isManualNavigation: false,
  setIsManualNavigation: () => {},
  navigateToSection: () => {},
})

export const useNavigation = () => useContext(NavigationContext)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isManualNavigation, setIsManualNavigation] = useState(false)

  const navigateToSection = useCallback((sectionId: string) => {
    // Set flag to indicate this is a manual navigation
    setIsManualNavigation(true)
    setActiveSection(sectionId)

    // Find the section element
    const section = document.getElementById(sectionId)
    if (section) {
      // Scroll to the section
      section.scrollIntoView({ behavior: "smooth" })

      // Update URL without reload
      window.history.pushState(null, "", `#${sectionId}`)

      // Reset the manual navigation flag after animation completes
      setTimeout(() => {
        setIsManualNavigation(false)
      }, 1000) // Adjust based on your scroll animation duration
    }
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isManualNavigation,
        setIsManualNavigation,
        navigateToSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}
