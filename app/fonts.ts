// app/fonts.ts
import { Plus_Jakarta_Sans, Cormorant_Garamond, Inter } from "next/font/google";

// 1) Preload the EXACT face used above the fold (italic 700)
export const corm = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],        // <- important for your hero line
  weight: ["700"],          // <- matches your heading weight
  display: "swap",
  preload: true,            // preload only this face
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: true, // keeps metrics aligned to avoid CLS
});

// 2) UI fonts later → no preload (keeps DevTools clean)
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["normal"],        // add "italic" only if you actually use it
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: true,
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: true,
});
