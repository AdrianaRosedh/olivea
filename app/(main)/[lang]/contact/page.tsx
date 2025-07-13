// app/(main)/[lang]/contact/page.tsx
import { Metadata } from "next";
import { MapPin, Phone, Mail, Clock  } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Olivea",
};

export default function ContactPage() {
  const address = "México 3 Km 92.5, 22766 Villa de Juárez, B.C.";
  const brand = {
    text: "text-olive-800",
    border: "border-olive-200",
    icon: "text-olive-600",
    link: "text-olive-700 hover:text-olive-900",
  };

  return (
    <main className="-mt-16 md:mt-0 px-4 md:px-8 lg:px-16 pt-0 md:pt-20 pb-8">
      <div
        className={`
          mx-auto
          bg-[var(--olivea-mist)] rounded-2xl shadow-lg
          overflow-hidden
          grid gap-0
          md:grid-cols-[1fr_1.1fr]
          max-w-screen-2xl
        `}
      >
        {/* ─── Map Pane ───────────────────────── */}
        <div className="aspect-[4/3] md:aspect-auto w-full">
          <iframe
            className="w-full h-full block"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3383.8926257165144!2d-116.64207809999999!3d31.990926100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d8eda5aec9876d%3A0x6c5367c9c38f1204!2sOlivea%20Farm%20to%20Table!5e0!3m2!1sen!2smx!4v1752379031167!5m2!1sen!2smx"
            title="Olivea location"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* ─── Info Pane ───────────────────────── */}
        <div className={`p-6 md:p-8 space-y-6 overflow-auto`}>
          {/* Combined heading */}
          <p className={`${brand.text} font-semibold text-lg md:text-xl`}>
            Olivea Farm To Table &bull; Casa Olivea &bull; Olivea Café
          </p>

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className={`${brand.icon} w-5 h-5 flex-shrink-0`} />
            <a
              href="https://maps.app.goo.gl/oySkL6k7G7t5VFus5"
              target="_blank"
              rel="noopener noreferrer"
              className={`${brand.text} underline`}
            >
              {address}
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className={`${brand.icon} w-5 h-5 flex-shrink-0`} />
            <a
              href="mailto:hello@casaolivea.com"
              className={`underline ${brand.link}`}
            >
              hello@casaolivea.com
            </a>
          </div>

          <hr className={`${brand.border}`} />

          {/* Farm To Table */}
          <div className="space-y-2">
            <p className={`${brand.text} font-semibold`}>Olivea Farm To Table</p>
            <div className="flex items-center gap-3">
              <Phone className={`${brand.icon} w-5 h-5 flex-shrink-0`} />
              <a
                href="tel:+5246463836402"
                className={brand.link}
              >
                (646) 383-6402
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className={`${brand.icon} w-5 h-5 flex-shrink-0 mt-0.5`} />
              <ul className="list-inside list-disc text-sm space-y-1">
                <li>Wed: 5 PM – 8 PM</li>
                <li>Fri: 3:30 PM – 8:30 PM</li>
                <li>Sun: 3 PM – 8 PM</li>
              </ul>
            </div>
          </div>

          <hr className={`${brand.border}`} />

          {/* Casa & Café */}
          <div className="space-y-2">
            <p className={`${brand.text} font-semibold`}>
              Casa Olivea & Olivea Café
            </p>
            <div className="flex items-center gap-3">
              <Phone className={`${brand.icon} w-5 h-5 flex-shrink-0`} />
              <a
                href="tel:+5246463882369"
                className={brand.link}
              >
                (646) 388-2369
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className={`${brand.icon} w-5 h-5 flex-shrink-0 mt-0.5`} />
              <ul className="list-inside list-disc text-sm space-y-1">
                <li>Wed – Mon: 7:30 AM – 2:30 PM</li>
                <li>Tue: 7:30 AM – 9:30 PM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}