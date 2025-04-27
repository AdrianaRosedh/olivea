import type React from "react"
import "@/app/globals.css"
import LayoutShell from "@/components/LayoutShell"

// Import fonts with Next.js 15 compatibility
import { Cormorant_Garamond, Inter } from "next/font/google"

// Define Cormorant Garamond with only the available weights
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // Only use weights that are available: 300, 400, 500, 600, 700
  weight: ["300", "400", "500", "600", "700"],
  // Only include normal and italic styles
  style: ["normal", "italic"],
  display: "swap",
})

// Define Inter with standard weights
const inter = Inter({
  subsets: ["latin"],
  // Standard weights for Inter
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

type Props = {
  children: React.ReactNode
  params: { lang: "en" | "es" }
}

// Change the function to be async and properly await the params
export default async function LangLayout({ children, params }: Props) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang

  return (
    <html lang={lang} className={`${cormorant.className} ${inter.className}`}>
      <body className={inter.className}>
        <LayoutShell lang={lang}>{children}</LayoutShell>
      </body>
    </html>
  )
}
