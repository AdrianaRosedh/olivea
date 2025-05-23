// tailwind.config.ts
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    // everything else (assets, contexts, lib, etc.) doesn’t need scanning
  ],
  theme: {
    extend: {
      colors: {
        // map your CSS variables to Tailwind names so you can do `bg-muted`, etc.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary:    "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        secondary:  "hsl(var(--secondary) / <alpha-value>)",
        accent:     "hsl(var(--accent) / <alpha-value>)",
        muted:      "hsl(var(--muted) / <alpha-value>)",
        border:     "hsl(var(--border) / <alpha-value>)",
        ring:       "hsl(var(--ring) / <alpha-value>)",
        // etc…
      },
      boxShadow: {
        xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [
    animate,     // <— only plugin you actually have installed
  ],
};

export default config;