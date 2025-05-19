// app/layout.tsx
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ReservationProvider } from "@/contexts/ReservationContext";
import ReservationModal from "@/components/forms/reservation/ReservationModal";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], weight: ["400"], display: "swap" });
const corm = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} ${corm.className}`}>
      <head>
        {/* ─── OFFICIAL TOCK SNIPPET (redundant if you use app/head.tsx, but safe) ─── */}
        <Script id="tock-embed" strategy="afterInteractive">
          {`
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?e.callMethod.apply(e,arguments):e.queue.push(arguments)
                };
                t._tock||(t._tock=e),
                e.push=e,e.loaded=!0,e.version='1.0',e.queue=[];
                var f=o.createElement(c);
                f.async=!0,f.src=k;
                var g=o.getElementsByTagName(c)[0];
                g.parentNode.insertBefore(f,g);
              }
            }(window,document,'script','https://www.exploretock.com/tock.js');
            tock('init','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJidXNpbmVzc0lkIjoiMzc0OTkiLCJ0eXBlIjoiV0lER0VUX0JVSUxERVIiLCJpYXQiOjE3NDc1Mzc4MzV9.l3nMRBi3EDY-V5_y1zX8L9hpgUHk59M89edcU6x3nK4');
          `}
        </Script>
      </head>
      <body className="bg-[var(--olivea-cream)] text-[var(--olivea-ink)] font-inter">
        <ReservationProvider>
          {children}
          <ReservationModal lang="es" />
        </ReservationProvider>
        {/* …whistle chat, etc… */}
      </body>
    </html>
  );
}