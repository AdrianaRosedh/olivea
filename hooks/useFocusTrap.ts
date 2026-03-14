import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary';

/**
 * Trap keyboard focus inside a container while `active` is true.
 * Returns a ref to attach to the container element.
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  active,
  onEscape,
  initialFocusRef,
}: {
  active: boolean;
  onEscape?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Save the element that had focus before the trap activated
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the trap
    const frame = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      }
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      if (e.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);

      // Restore previous focus
      previousFocusRef.current?.focus();
    };
  }, [active, onEscape, initialFocusRef]);

  return containerRef;
}
