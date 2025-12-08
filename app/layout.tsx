import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "./providers";
import { fontsClass } from "./fonts";
import PathTracker from "@/components/PathTracker";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),

  title: "OLIVEA | Donde el huerto es la esencia",
  description:
    "OLIVEA: restaurante de degustación, hotel y café nacidos del huerto en Valle de Guadalupe. Donde el huerto es la esencia.",

  alternates: {
    canonical: "/",
    languages: { "es-MX": "/es", "en-US": "/en" },
  },

  openGraph: {
    type: "website",
    url: SITE.baseUrl,
    title: "OLIVEA | Donde el huerto es la esencia",
    description:
      "OLIVEA Farm To Table Restaurante de degustación, hotel Casa OLIVEA y OLIVEA Café arraigados en un huerto vivo en Valle de Guadalupe.",
    siteName: "OLIVEA",
    images: [
      {
        url: absoluteUrl("/images/og/cover.jpg"),
        width: 1200,
        height: 630,
        alt: "OLIVEA",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OLIVEA | Donde el huerto es la esencia",
    description:
      "Gastronomía, hotel y café nacidos del huerto en Valle de Guadalupe. Where the garden is the essence.",
    images: [absoluteUrl("/images/og/cover.jpg")],
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

  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180" },
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontsClass}>
      <head />
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)]">
        <noscript>
          <style>{`.fixed-lcp{opacity:0 !important;transition:none !important;pointer-events:none !important;}`}</style>
        </noscript>

        <PathTracker />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}