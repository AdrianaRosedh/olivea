// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AppProviders } from "./providers";
import { fontsClass } from "./fonts";
import PathTracker from "@/components/PathTracker";
import { SITE, canonicalUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";
import VhSetter from "@/components/ui/VhSetter";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#65735b",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.canonicalBaseUrl),

  title: "OLIVEA | Hospitalidad del Huerto en Valle de Guadalupe",
  description:
    "OLIVEA: hospitalidad del huerto en Valle de Guadalupe — restaurante de degustación con estrella MICHELIN, hospedaje y café nacidos del huerto. Donde el huerto es la esencia.",

  alternates: {
    languages: {
      "es-MX": "/es",
      "en-US": "/en",
      es: "/es",
      en: "/en",
    },
  },

  openGraph: {
    type: "website",
    url: canonicalUrl("/"),
    title: "OLIVEA | Hospitalidad del Huerto en Valle de Guadalupe",
    description:
      "OLIVEA — farm hospitality in Valle de Guadalupe: MICHELIN-starred restaurant, farm stay, and café rooted in a working garden in Baja California.",
    siteName: "OLIVEA",
    images: [
      {
        url: canonicalUrl("/images/og/cover.jpg"),
        width: 1200,
        height: 630,
        alt: "OLIVEA",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OLIVEA | Farm Hospitality in Valle de Guadalupe",
    description:
      "Farm hospitality in Valle de Guadalupe — MICHELIN-starred restaurant, farm stay, and café born from the garden. Where the garden is the essence.",
    images: [canonicalUrl("/images/og/cover.jpg")],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  appleWebApp: {
    title: "OLIVEA",
    capable: true,
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },

  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontsClass}>
      <head>
        {/*
          ✅ Pre-hydration PWA standalone detection.
          Runs before first paint so `pwa-safe-*` utility classes
          pick up env(safe-area-inset-*) on iOS immediately (no flash).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;if(s)document.documentElement.classList.add('pwa-standalone');}catch(e){}})();`,
          }}
        />

        {/*
          ✅ Preconnect to third-party origins used on first paint.
          Opens TCP+TLS early so the first request to each origin doesn't
          pay the full handshake cost. Keep this list tight — every preconnect
          competes for bandwidth with the LCP image.
        */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        <link rel="preconnect" href="https://static1.cloudbeds.com" crossOrigin="" />
        <link rel="preconnect" href="https://hotels.cloudbeds.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.opentable.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.opentable.com.mx" crossOrigin="" />
        {/* DNS-only hints for origins that may load later but are likely */}
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M3JEDWZ732"
          strategy="lazyOnload"
        />
        <Script id="ga-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M3JEDWZ732');
          `}
        </Script>
      </head>

      <body className="bg-background text-foreground">
        <noscript>
          <style>
            {`.fixed-lcp{opacity:0 !important;transition:none !important;pointer-events:none !important;}`}
          </style>
        </noscript>

        {/* ✅ sets --app-vh globally (Android/iOS viewport fixes) */}
        <VhSetter />

        <PathTracker />
        <AppProviders>{children}</AppProviders>

        <Analytics />
      </body>
    </html>
  );
}
