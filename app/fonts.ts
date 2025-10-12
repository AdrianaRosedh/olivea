import { Plus_Jakarta_Sans, Cormorant_Garamond, Inter } from "next/font/google";

// The serif is what users see first → preload it (exact weight used above the fold)
export const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],   // match what you actually render
  display: "swap",
  preload: true,
});

// UI fonts used later → don't preload to avoid warnings
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500","700"], // keep for later use, but:
  display: "swap",
  preload: false,
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});
