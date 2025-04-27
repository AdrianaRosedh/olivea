"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Simple ViewTransitionsProvider that doesn't rely on experimental imports
export default function ViewTransitionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    // Check if the View Transitions API is supported
    if (document.startViewTransition) {
      // Add a class to the body when transitions are supported
      document.body.classList.add("view-transitions-supported")
    }

    // Handle navigation events
    const handleNavigate = () => {
      setIsPending(true)
    }

    const handleNavigateComplete = () => {
      setIsPending(false)
    }

    // Clean up
    return () => {
      document.body.classList.remove("view-transitions-supported")
    }
  }, [router])

  return (
    <>
      {children}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  )
}
