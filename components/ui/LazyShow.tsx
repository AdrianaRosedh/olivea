"use client";
import { ReactNode, useState, useRef, useEffect } from "react";

export default function LazyShow({
  children,
  minHeight = 1,
  rootMargin = "600px 0px 600px 0px",
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={!show ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
