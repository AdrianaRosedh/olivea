// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  title: "Olivea",
  description: "Experience the garden.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no",
};

declare global {
  interface Window {
    WhistleLiveChat?: {
      company: string;
      source: string;
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${corm.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        <ScrollProvider>{children}</ScrollProvider>

        {/* Whistle configuration */}
        <Script id="whistle-config" strategy="afterInteractive">
          {`window.WhistleLiveChat = { company: "295565", source: "https://plugins.whistle.cloudbeds.com" };`}
        </Script>

        {/* Whistle external script */}
        <Script
          id="whistle-live-chat-script"
          src="https://plugins.whistle.cloudbeds.com/live-chat/initialize.js"
          strategy="afterInteractive"
        />

        {/* 👇 Hidden Global Whistle Toggle Button 👇 */}
        <button id="chatbot-toggle" style={{ display: "none" }} />
      </body>
    </html>
  );
}