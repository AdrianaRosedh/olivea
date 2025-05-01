import "./globals.css"
import { Providers } from "./providers"
import type { ReactNode } from "react"

export const metadata = {
  title: "Olivea",
  description: "Garden-rooted hospitality in Valle de Guadalupe",
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}