import { Lora, Cormorant_Garamond, Plus_Jakarta_Sans, Inter } from "next/font/google";

export const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

/** Only for the hero line — preloaded italic 700 */
export const cormHero = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["700"],
  display: "swap",
  preload: true,
  variable: "--font-serif-hero",
});

/** Normal serif for any other places you need Cormorant without italics */
export const corm = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "700"],
  display: "swap",
  preload: false, // don't preload; not above-the-fold critical
  variable: "--font-serif",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-sans",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

/** Convenience for <html className=...> */
export const fontsClass =
  `${jakarta.variable} ${corm.variable} ${cormHero.variable} ${jakarta.className}`;