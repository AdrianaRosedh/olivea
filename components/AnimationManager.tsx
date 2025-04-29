"use client"

import { useLayoutEffect } from "react"

export default function AnimationManager() {
  useLayoutEffect(() => {
    const initializeAnimations = () => {
      document.body.classList.add("animations-initialized")
      window.dispatchEvent(new Event("scroll")) // optional, refresh listeners once
    }

    if (document.readyState === "complete") {
      initializeAnimations()
    } else {
      window.addEventListener("load", initializeAnimations)
      return () => window.removeEventListener("load", initializeAnimations)
    }
  }, [])

  return null
}