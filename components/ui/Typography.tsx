import { cn } from "@/lib/utils"
import type React from "react"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function TypographyH1({ children, className }: TypographyProps) {
  return <h1 className={cn("heading-hero", className)}>{children}</h1>
}

export function TypographyH2({ children, className }: TypographyProps) {
  return <h2 className={cn("heading-section", className)}>{children}</h2>
}

export function TypographyH3({ children, className }: TypographyProps) {
  return <h3 className={cn("heading-sub", className)}>{children}</h3>
}

export function TypographyP({ children, className }: TypographyProps) {
  return <p className={cn("text-body", className)}>{children}</p>
}

export function TypographyAccent({ children, className }: TypographyProps) {
  return <p className={cn("text-accent", className)}>{children}</p>
}

export function TypographyQuote({ children, className }: TypographyProps) {
  return <blockquote className={cn(className)}>{children}</blockquote>
}

export function TypographyCTA({ children, className }: TypographyProps) {
  return <p className={cn("cta-text", className)}>{children}</p>
}

export function TypographyNav({ children, className }: TypographyProps) {
  return <span className={cn("text-nav", className)}>{children}</span>
}
