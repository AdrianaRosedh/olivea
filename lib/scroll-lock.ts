let isLocked = false
let timeoutRef: NodeJS.Timeout | null = null

export function lockScroll(forMs: number = 800) {
  isLocked = true
  if (timeoutRef) clearTimeout(timeoutRef)
  timeoutRef = setTimeout(() => {
    isLocked = false
  }, forMs)
}

export function isScrollLocked() {
  return isLocked
}