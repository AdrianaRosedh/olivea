// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ReservationProvider } from "@/contexts/ReservationContext";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.className} ${corm.className}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        <ReservationProvider>{children}</ReservationProvider>

        {/* ─── WHISTLE LIVE CHAT ───────────────────────── */}
        <Script id="whistle-config" strategy="afterInteractive">
          {`
            window.WhistleLiveChat = {
              company: "295565",
              source: "https://plugins.whistle.cloudbeds.com"
            };
          `}
        </Script>
        <Script
          id="whistle-script"
          src="https://plugins.whistle.cloudbeds.com/live-chat/initialize.js"
          strategy="afterInteractive"
        />
        <button id="chatbot-toggle" style={{ display: "none" }} />

        {/* ─── TOCK RESERVATIONS WIDGET ─────────────────── */}
        {/* 1) loader snippet */}
        <Script id="tock-loader" strategy="afterInteractive">
          {`
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?
                    e.callMethod.apply(e,arguments):
                    e.queue.push(arguments)
                };
                t._tock||(t._tock=e),
                e.push=e,
                e.loaded=!0,
                e.version='1.0',
                e.queue=[];
                var f=o.createElement(c);
                f.async=!0;
                f.src=k;
                var g=o.getElementsByTagName(c)[0];
                g.parentNode.insertBefore(f,g)
              }
            }(window,document,'script','https://www.exploretock.com/tock.js');
          `}
        </Script>

        {/* 2) init call */}
        <Script id="tock-init" strategy="afterInteractive">
          {`
            tock('init', 'olivea-farm-to-table');
          `}
        </Script>
      </body>
    </html>
  );
}
