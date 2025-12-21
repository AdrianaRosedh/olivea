import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "./providers";
import { fontsClass } from "./fonts";
import PathTracker from "@/components/PathTracker";
import { absoluteUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react"; // ← ADD THIS

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),

  title: "OLIVEA | Donde el huerto es la esencia",
  description:
    "OLIVEA: restaurante de degustación, hotel y café nacidos del huerto en Valle de Guadalupe. Donde el huerto es la esencia.",

  alternates: {
    canonical: "/",
    languages: {
      "es-MX": "/",
      en: "/en",
    },
  },

  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    title: "OLIVEA | Donde el huerto es la esencia",
    description:
      "OLIVEA Farm To Table, hotel Casa OLIVEA y OLIVEA Café arraigados en un huerto vivo en Valle de Guadalupe.",
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

  appleWebApp: { title: "OLIVEA" },

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

  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={fontsClass}>
      <head />
      <body className="bg-background text-foreground">
        <noscript>
          <style>
            {`.fixed-lcp{opacity:0 !important;transition:none !important;pointer-events:none !important;}`}
          </style>
        </noscript>

        <PathTracker />
        <AppProviders>{children}</AppProviders>

        {/* ✅ Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}