// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import type { Metadata } from "next";
import { AppProviders } from "./providers";

const inter = Inter({ subsets: ["latin"], weight: ["400"], display: "swap" });
const corm = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "Familia Olivea",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  }
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} ${corm.className} ${jakarta.className}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* If you truly need preload, do it explicitly as a link: */}
        <link rel="preload" href="/assets/alebrije-1.svg" as="image" type="image/svg+xml" />
      </head>
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        <AppProviders>{children}</AppProviders>

        <Script id="whistle-config" strategy="lazyOnload">
          {`
            window.WhistleLiveChat = {
              company: "295565",
              source: "https://plugins.whistle.cloudbeds.com"
            };
          `}
        </Script>
        <Script id="whistle-script" src="https://plugins.whistle.cloudbeds.com/live-chat/initialize.js" strategy="lazyOnload" />
        <button id="chatbot-toggle" style={{ display: "none" }} />
      </body>
    </html>
  );
}