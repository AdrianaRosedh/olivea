import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "./providers";
import { jakarta } from "./fonts"; // ⬅️ only the default font at root

export const metadata: Metadata = {
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
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.className}>
      {/* remove font-inter on body so Inter isn’t forced at T=0 */}
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
