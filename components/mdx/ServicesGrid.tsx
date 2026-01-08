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
      text: "Wi-Fi is available throughout the property, including all rooms, patios, and the paddle court. Electrical outlets are thoughtfully placed across shared and private spaces.",
    },
    {
      id: "confort",
      title: "Comfort",
      text: "Blackout curtains, natural airflow, and climate control — every detail designed to protect your rest.",
    },
    {
      id: "detalles-habitacion",
      title: "Room Details",
      text: "Filtered water in glass, refillable amenities, and our own house scent — botanical, balanced, and understated.",
    },
    {
      id: "opciones-accesibles",
      title: "Accessible Design",
      text: "All rooms at Casa Olivea are located on the ground floor, ensuring easy access without steps or level changes.",
    },
    {
      id: "conserjeria",
      title: "Concierge",
      text: "Reach us anytime via WhatsApp or through our guest portal. We’re happy to assist with reservations, transportation, or local recommendations.",
    },
    {
      id: "conexion-local",
      title: "Local Connection",
      text: "Looking for a vineyard or a quiet place to explore? We’ll share our personal recommendations — from long-table lunches to hidden corners.",
    },
  ],
  es: [
    {
      id: "conectividad",
      title: "Conectividad",
      text: "Wi-Fi disponible en toda la propiedad, incluyendo habitaciones, patios y la cancha de pádel. Hay enchufes distribuidos de forma práctica en áreas comunes y privadas.",
    },
    {
      id: "confort",
      title: "Confort",
      text: "Cortinas blackout, ventilación natural y control de temperatura — cada detalle está pensado para cuidar tu descanso.",
    },
    {
      id: "detalles-habitacion",
      title: "Detalles de Habitación",
      text: "Agua filtrada en vidrio, amenidades rellenables y nuestra esencia botánica propia — equilibrio y sencillez.",
    },
    {
      id: "opciones-accesibles",
      title: "Diseño Accesible",
      text: "Todas las habitaciones de Casa Olivea se encuentran en planta baja, permitiendo un acceso cómodo y continuo, sin escalones.",
    },
    {
      id: "conserjeria",
      title: "Conserjería",
      text: "Escríbenos por WhatsApp o a través de nuestro portal para huéspedes en cualquier momento. Con gusto te ayudamos con reservas, traslados y recomendaciones locales.",
    },
    {
      id: "conexion-local",
      title: "Conexión Local",
      text: "¿Buscas un viñedo o un rincón especial del Valle? Compartimos nuestras recomendaciones personales — desde mesas largas hasta lugares discretos.",
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
          <p className="text-sm text-gray-800 leading-relaxed">
            {item.text}
          </p>

          <span className="sr-only">{`Anchor: #${item.id}`}</span>
        </motion.article>
      ))}
    </div>
  );
}
