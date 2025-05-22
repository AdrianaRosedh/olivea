// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import type { Metadata } from "next";
import { Providers } from "./providers";   // ← import your Providers

const inter = Inter({ subsets: ["latin"], weight: ["400"], display: "swap" });
const corm = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "Grupo Olivea",
  icons: { icon: "/favicon.ico", apple: "/apple-icon.png", shortcut: "/favicon.ico" },
  manifest: "/manifest.json",
  appleWebApp: { title: "Grupo Olivea" },
  other: {
    preload: [
      // Hero video (MP4 + WebM)
      '<link rel="preload" href="/videos/homepage-temp.webm" as="video" type="video/webm" fetchpriority="high" />',
      '<link rel="preload" href="/videos/homepage-temp.mp4"  as="video" type="video/mp4"  fetchpriority="high" />',

      // Card transition clips (WebM + MP4)
      '<link rel="preload" href="/videos/transition1.webm" as="video" type="video/webm" fetchpriority="low" />',
      '<link rel="preload" href="/videos/transition1.mp4"  as="video" type="video/mp4"  fetchpriority="low" />',
      '<link rel="preload" href="/videos/transition2.webm" as="video" type="video/webm" fetchpriority="low" />',
      '<link rel="preload" href="/videos/transition2.mp4"  as="video" type="video/mp4"  fetchpriority="low" />',
      '<link rel="preload" href="/videos/transition3.webm" as="video" type="video/webm" fetchpriority="low" />',
      '<link rel="preload" href="/videos/transition3.mp4"  as="video" type="video/mp4"  fetchpriority="low" />',

      // any other critical assets
      '<link rel="preload" href="/assets/alebrije-1.svg" as="image" type="image/svg+xml" />',
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} ${corm.className} ${jakarta.className}`}>
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        {/* ← now every page is wrapped in Providers (client only) */}
        <Providers>
          {children}
        </Providers>

        {/* Tock Script */}
        <Script id="tock-script" strategy="beforeInteractive">
          {`
            !function(t,o,c,k){if(!t.tock){var e=t.tock=function(){e.callMethod?
            e.callMethod.apply(e,arguments):e.queue.push(arguments)};t._tock||(t._tock=e),
            e.push=e,e.loaded=!0,e.version='1.0',e.queue=[];var f=o.createElement(c);f.async=!0,
            f.src=k;var g=o.getElementsByTagName(c)[0];g.parentNode.insertBefore(f,g)}}(
            window,document,'script','https://www.exploretock.com/tock.js');
            tock('init', 'olivea-farm-to-table');
          `}
        </Script>

        {/* Whistle Live Chat */}
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