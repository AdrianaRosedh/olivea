"use client"

import { useEffect, useState, type RefObject } from "react"

interface UseIntersectionObserverProps {
  ref: RefObject<Element>
  options?: IntersectionObserverInit
  threshold?: number | number[]
  rootMargin?: string
}

/**
 * Custom hook for detecting when an element enters the viewport
 */
export function useIntersectionObserver({
  ref,
  options = {},
  threshold = 0,
  rootMargin = "0px",
}: UseIntersectionObserverProps): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref?.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin,
        ...options,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, options, threshold, rootMargin])

  return isIntersecting
}
