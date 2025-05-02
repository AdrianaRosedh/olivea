// components/ui/Typography.tsx
"use client"

import React from "react"
import { cn } from "@/lib/utils"

// ——————————————————————————————————————————————
// H1
// ——————————————————————————————————————————————
export interface TypographyH1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function TypographyH1({ children, className, ...props }: TypographyH1Props) {
  return (
    <h1 className={cn("heading-hero", className)} {...props}>
      {children}
    </h1>
  )
}

// ——————————————————————————————————————————————
// H2
// ——————————————————————————————————————————————
export interface TypographyH2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function TypographyH2({ children, className, ...props }: TypographyH2Props) {
  return (
    <h2 className={cn("heading-section", className)} {...props}>
      {children}
    </h2>
  )
}

// ——————————————————————————————————————————————
// H3
// ——————————————————————————————————————————————
export interface TypographyH3Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function TypographyH3({ children, className, ...props }: TypographyH3Props) {
  return (
    <h3 className={cn("heading-sub", className)} {...props}>
      {children}
    </h3>
  )
}

// ——————————————————————————————————————————————
// Paragraph
// ——————————————————————————————————————————————
export interface TypographyPProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function TypographyP({ children, className, ...props }: TypographyPProps) {
  return (
    <p className={cn("text-body", className)} {...props}>
      {children}
    </p>
  )
}

// ——————————————————————————————————————————————
// Accent paragraph
// ——————————————————————————————————————————————
export interface TypographyAccentProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function TypographyAccent({ children, className, ...props }: TypographyAccentProps) {
  return (
    <p className={cn("text-accent", className)} {...props}>
      {children}
    </p>
  )
}

// ——————————————————————————————————————————————
// Blockquote
// ——————————————————————————————————————————————
export interface TypographyQuoteProps extends React.BlockquoteHTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function TypographyQuote({ children, className, ...props }: TypographyQuoteProps) {
  return (
    <blockquote className={cn(className)} {...props}>
      {children}
    </blockquote>
  )
}

// ——————————————————————————————————————————————
// Call-to-action text
// ——————————————————————————————————————————————
export interface TypographyCTAProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function TypographyCTA({ children, className, ...props }: TypographyCTAProps) {
  return (
    <p className={cn("cta-text", className)} {...props}>
      {children}
    </p>
  )
}

// ——————————————————————————————————————————————
// Navigation text (inline span)
// ——————————————————————————————————————————————
export interface TypographyNavProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export function TypographyNav({ children, className, ...props }: TypographyNavProps) {
  return (
    <span className={cn("text-nav", className)} {...props}>
      {children}
    </span>
  )
}
