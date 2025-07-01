// components/sections/Section.tsx
"use client"

import React from "react"

interface SectionProps {
  id: string
  className?: string
  children: React.ReactNode
}

export function Section({ id, className = "", children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`section-center ${className}`}
    >
      {children}
    </section>
  )
}