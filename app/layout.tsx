// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ReservationProvider } from "@/contexts/ReservationContext";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.className} ${corm.className}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        <ReservationProvider>{children}</ReservationProvider>

        {/* ─── WHISTLE LIVE CHAT ───────────────────────── */}
        <Script id="whistle-config" strategy="afterInteractive">
          {`
            window.WhistleLiveChat = {
              company: "295565",
              source: "https://plugins.whistle.cloudbeds.com"
            };
          `}
        </Script>
        <Script
          id="whistle-script"
          src="https://plugins.whistle.cloudbeds.com/live-chat/initialize.js"
          strategy="afterInteractive"
        />
        <button id="chatbot-toggle" style={{ display: "none" }} />
      </body>
    </html>
  );
}