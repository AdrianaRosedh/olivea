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

        {/* Whistle Live Chat Plugin */}
        <Script
          id="whistle-live-chat-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              window.WhistleLiveChat={ company:"295565", source: "https://plugins.whistle.cloudbeds.com" };
              var e=document.createElement("script");
              e.async=true;
              e.type="text/javascript";
              e.src=window.WhistleLiveChat.source + "/live-chat/initialize.js";
              var t=document.getElementsByTagName("script")[0];
              t.parentNode.insertBefore(e,t);
            })();`,
          }}
        />
      </body>
    </html>
  );
}