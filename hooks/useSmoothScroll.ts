import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function useSmoothScroll() {
  useEffect(() => {
    // Initialize Lenis with supported options
    const lenis = new Lenis({
      wrapper: document.body,   // scroll container
      lerp: 0.1,                // interpolation intensity (0–1)—lower is smoother
      duration: 1.2,            // animation duration in seconds (fallback if lerp isn’t used)
      easing: (t: number) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)), // default ease-out
    })

    // Drive Lenis on each RAF
    function onRaf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(onRaf)
    }
    requestAnimationFrame(onRaf)

    return () => {
      lenis.destroy()
    }
  }, [])
}