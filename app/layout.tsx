// app/layout.tsx
// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { ReservationProvider } from "@/contexts/ReservationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${corm.variable}`} suppressHydrationWarning>
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        {/* ─── TOCK STUB ONLY ───────────────────────────── */}
        <Script id="tock-stub" strategy="beforeInteractive">
          {`
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?
                    e.callMethod.apply(e,arguments):
                    e.queue.push(arguments)
                };
                e.queue=[]; e.loaded=!0; e.version='1.0';
                var f=o.createElement(c), g=o.getElementsByTagName(c)[0];
                f.async=!0; f.src=k; g.parentNode.insertBefore(f,g);
              }
            }(window, document, 'script', 'https://www.exploretock.com/tock.js');
          `}
        </Script>

        <ReservationProvider>
          {children}
        </ReservationProvider>

        {/* ─── WHISTLE LIVE CHAT ───────────────────────── */}
        <Script id="whistle-config" strategy="afterInteractive">
          {`window.WhistleLiveChat = { company: "295565", source: "https://plugins.whistle.cloudbeds.com" };`}
        </Script>
        <Script
          id="whistle-script"
          src="https://plugins.whistle.cloudbeds.com/live-chat/initialize.js"
          strategy="afterInteractive"
        />
        <button id="chatbot-toggle" style={{ display: "none" }} />
      </body>
    </html>
  );
}
