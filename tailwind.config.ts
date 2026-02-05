// tailwind.config.ts
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:          "hsl(var(--background) / <alpha-value>)",
        foreground:          "hsl(var(--foreground) / <alpha-value>)",
        primary:             "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground":"hsl(var(--primary-foreground) / <alpha-value>)",
        secondary:           "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground":"hsl(var(--secondary-foreground) / <alpha-value>)",
        accent:              "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
        muted:               "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground":  "hsl(var(--muted-foreground) / <alpha-value>)",
        border:              "hsl(var(--border) / <alpha-value>)",
        ring:                "hsl(var(--ring) / <alpha-value>)",
        destructive:         "hsl(var(--destructive, 0 100% 50%) / <alpha-value>)",
        "destructive-foreground":
                             "hsl(var(--destructive-foreground, 0 0% 100%) / <alpha-value>)",
      },
      boxShadow: {
        xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
      spacing: {
        // if you have any custom “size-” utilities, put them here:
        4.5: "1.125rem",
        7.5: "1.875rem",
      },
      borderRadius: {
        "2xl": "1.5rem", // match your modal radius
      },
    },
  },
  plugins: [
    animate,
    typography,
    // if you ever need forms or aspect‐ratio, add here:
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
