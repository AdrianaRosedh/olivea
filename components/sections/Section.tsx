// components/sections/Section.tsx
'use client'

import { ReactNode } from 'react'

interface SectionProps {
  id: string
  children: ReactNode
  className?: string   // allow callers to inject "main‐section" or "subsection"
}

export function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section
      id={id}
      data-section-id={id}
      className={
        `min-h-screen w-full flex flex-col items-center justify-center px-6 snap-center scroll-mt-[120px] ` +
        className
      }
      aria-labelledby={`${id}-heading`}
    >
      {children}
    </section>
  )
}
