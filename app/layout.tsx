// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import type { Metadata } from "next";
import { AppProviders } from "./providers";  // ← correct path

const inter = Inter({ subsets: ["latin"], weight: ["400"], display: "swap" });
const corm = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "Grupo Olivea",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: { title: "Grupo Olivea" },
  other: {
    preload: [
      // any global preloads (e.g. icon)
      '<link rel="preload" href="/assets/alebrije-1.svg" as="image" type="image/svg+xml" />',
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.className} ${corm.className} ${jakarta.className}`}
    >
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        {/* Wrap *all* pages in your global providers */}
        <AppProviders>
          {children}
        </AppProviders>

        {/* Global third‐party scripts */}
        <Script id="tock-script" strategy="lazyOnload">
          {`
            !function(t,o,c,k){if(!t.tock){var e=t.tock=function(){e.callMethod?    
            e.callMethod.apply(e,arguments):e.queue.push(arguments)};t._tock||(t._tock=e),    
            e.push=e,e.loaded=!0,e.version='1.0',e.queue=[];var f=o.createElement(c);f.async=!0,    
            f.src=k;var g=o.getElementsByTagName(c)[0];g.parentNode.insertBefore(f,g)}}(    
            window,document,'script','https://www.exploretock.com/tock.js');    
            tock('init', 'olivea-farm-to-table');
          `}
        </Script>
          

        <Script id="whistle-config" strategy="lazyOnload">
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
          strategy="lazyOnload"
        />
        <button id="chatbot-toggle" style={{ display: "none" }} />
      </body>
    </html>
  );
}