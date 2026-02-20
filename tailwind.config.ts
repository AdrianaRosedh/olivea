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
        // Existing semantic tokens (keep)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        destructive: "hsl(var(--destructive, 0 100% 50%) / <alpha-value>)",
        "destructive-foreground":
          "hsl(var(--destructive-foreground, 0 0% 100%) / <alpha-value>)",

        // ✅ OLIVEA brand tokens (NEW)
        olivea: {
          cream: "var(--olivea-cream)",
          shell: "var(--olivea-shell)",
          clay: "var(--olivea-clay)",
          olive: "var(--olivea-olive)", // the one you want everywhere
          ink: "var(--olivea-ink)",
          white: "var(--olivea-white)",
          soil: "var(--olivea-soil)",
          mist: "var(--olivea-mist)",
          sand: "var(--olivea-sand)",
          sage: "var(--olivea-sage)",
          // handy text roles (optional but super practical)
          text: "var(--olivea-olive)",
          "text-muted": "hsl(var(--muted-foreground) / <alpha-value>)",
        },

        // ✅ shortcuts (so you can write text-olivea / text-oliveaMuted)
        oliveaText: "var(--olivea-olive)",
        oliveaMuted: "hsl(var(--muted-foreground) / <alpha-value>)",
      },

      boxShadow: {
        xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
      spacing: {
        4.5: "1.125rem",
        7.5: "1.875rem",
      },
      borderRadius: {
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [animate, typography],
};

export default config;