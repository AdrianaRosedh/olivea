import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      wrapper: document.body,  // Explicitly target body clearly
      smoothWheel: true,
      smoothTouch: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])
}