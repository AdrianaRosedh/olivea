"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

type ServiceId =
  | "conectividad"
  | "confort"
  | "detalles-habitacion"
  | "opciones-accesibles"
  | "conserjeria"
  | "conexion-local";

type ServiceItem = {
  id: ServiceId;
  title: string;
  text: string;
};

const services: Record<"en" | "es", ServiceItem[]> = {
  en: [
    {
      id: "conectividad",
      title: "Connectivity",
      text: "Wi-Fi in all rooms and patios. Paddle court coverage. USB-C and universal outlets throughout.",
    },
    {
      id: "confort",
      title: "Comfort",
      text: "Blackout curtains, natural airflow, and climate control — every detail to protect your rest.",
    },
    {
      id: "detalles-habitacion",
      title: "Room Details",
      text: "Filtered water in glass, refillable toiletries, and our own house scent — botanical and balanced.",
    },
    {
      id: "opciones-accesibles",
      title: "Accessible Options",
      text: "We offer accessible ground-floor rooms on request — no steps, no visual clutter.",
    },
    {
      id: "conserjeria",
      title: "Concierge",
      text: "Message us anytime via WhatsApp. We’ll help with bookings, transport, or local tips.",
    },
    {
      id: "conexion-local",
      title: "Local Connection",
      text: "Need a vineyard to visit? We’ll suggest our favorites — from long-table lunches to hidden corners.",
    },
  ],
  es: [
    {
      id: "conectividad",
      title: "Conectividad",
      text: "Wi-Fi en habitaciones y patios. Cobertura incluso en la cancha de pádel. Enchufes universales y USB-C donde los necesitas.",
    },
    {
      id: "confort",
      title: "Confort",
      text: "Cortinas blackout, ventilación natural y control de temperatura — cada detalle cuida tu descanso.",
    },
    {
      id: "detalles-habitacion",
      title: "Detalles de Habitación",
      text: "Agua filtrada en vidrio, amenidades rellenables y nuestra esencia botánica propia — equilibrio sin excesos.",
    },
    {
      id: "opciones-accesibles",
      title: "Opciones Accesibles",
      text: "Habitaciones accesibles en planta baja disponibles bajo solicitud — sin escalones, sin distracciones visuales.",
    },
    {
      id: "conserjeria",
      title: "Conserjería",
      text: "Escríbenos por WhatsApp. Te ayudamos con reservas, traslados y recomendaciones en el Valle.",
    },
    {
      id: "conexion-local",
      title: "Conexión Local",
      text: "¿Buscas un viñedo? Te recomendamos nuestros favoritos — desde almuerzos largos hasta rincones escondidos.",
    },
  ],
};

export default function ServicesGrid() {
  const pathname = usePathname();
  const lang: "es" | "en" = pathname?.includes("/es") ? "es" : "en";
  const items = services[lang];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {items.map((item, i) => (
        <motion.article
          key={item.id}
          id={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="
            group
            p-5 bg-[#e7eae1] rounded-xl border border-[#dce3db] shadow-sm
            transition-transform duration-300 ease-out
            scroll-mt-30
          "
          aria-label={item.title}
        >
          <h3 className="font-semibold text-sm italic text-gray-700 mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>

          {/* subtle anchor hint (optional, but nice) */}
          <span className="sr-only">{`Anchor: #${item.id}`}</span>
        </motion.article>
      ))}
    </div>
  );
}
