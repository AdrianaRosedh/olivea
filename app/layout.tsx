// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ReservationProvider } from "@/contexts/ReservationContext";
import ReservationModal from "@/components/forms/reservation/ReservationModal";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], weight: ["400"], display: "swap" });
const corm = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} ${corm.className}`}>
      <head>
        <title>Grupo Olivea</title>

        {/* Tock Script */}
        <Script
          src="https://www.exploretock.com/tock.js"
          strategy="afterInteractive"
        />

        {/* Preloads */}
        <link
          rel="preload"
          href="/videos/homepage-temp.mp4"
          as="video"
          type="video/mp4"
        />
        <link
          rel="preload"
          href="/assets/alebrije-1.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>

      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        <ReservationProvider>
          {children}
          <ReservationModal lang="es" />
        </ReservationProvider>

        {/* Whistle Live Chat (unchanged) */}
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