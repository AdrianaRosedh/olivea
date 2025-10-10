import type { Metadata } from "next";

const sharedOgImage = "/images/hero.jpg"; // same file used as <video> poster

export const metadata: Metadata = {
  title: "Olivea — Donde el huerto es la esencia",
  description:
    "Olivea: Casa Olivea, Olivea Farm To Table y Olivea Café en Valle de Guadalupe.",
  openGraph: {
    title: "Olivea",
    description:
      "Casa Olivea, Olivea Farm To Table y Olivea Café en Valle de Guadalupe.",
    images: [{ url: sharedOgImage, width: 1200, height: 630, alt: "Olivea" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [sharedOgImage],
  },
};
