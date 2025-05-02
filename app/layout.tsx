// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";

// load fonts *once*
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = { title: "Olivea", description: "Experience the garden." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${corm.variable}`}>
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        {children}
      </body>
    </html>
  );
}