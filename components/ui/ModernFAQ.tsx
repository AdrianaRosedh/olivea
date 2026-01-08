'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

const faqs = {
  en: [
    {
      q: "Is breakfast included?",
      a: "Yes — a seasonal continental breakfast is included daily for two people from Olivea Café.",
    },
    {
      q: "Do you allow children or pets?",
      a: "Casa Olivea is adults-only (18+). Pets are not allowed in rooms.",
    },
    {
      q: "Can I use the paddle courts?",
      a: "Yes — guests have free access to the courts from 8am–6pm, with reservation.",
    },
    {
      q: "Do you offer airport pickup?",
      a: "Not directly, but we can recommend trusted local drivers.",
    },
    {
      q: "Are you part of the Michelin Guide?",
      a: "Yes — Casa Olivea is listed in the Michelin Guide, and our restaurant holds a Michelin Star and Green Star.",
    },
  ],
  es: [
    {
      q: "¿El desayuno está incluido?",
      a: "Sí — el desayuno continental de temporada está incluido todos los días para dos personas de Olivea Café.",
    },
    {
      q: "¿Se permiten niños o mascotas?",
      a: "Casa Olivea es solo para adultos (18+). No se permiten mascotas en las habitaciones.",
    },
    {
      q: "¿Puedo usar las canchas de pádel?",
      a: "Sí — los huéspedes tienen acceso gratuito de 8 am a 6 pm con reservación.",
    },
    {
      q: "¿Ofrecen transporte desde el aeropuerto?",
      a: "No directamente, pero podemos recomendar conductores locales de confianza.",
    },
    {
      q: "¿Están en la Guía Michelin?",
      a: "Sí — Casa Olivea aparece en la Guía Michelin y nuestro restaurante cuenta con una Estrella Michelin y Estrella Verde.",
    },
  ],
};

export default function ModernFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const lang = pathname?.includes('/es') ? 'es' : 'en';

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="space-y-4 mt-6">
      {faqs[lang].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          viewport={{ once: true }}
          className="rounded-xl border border-black/5 p-4 bg-transparent backdrop-blur-sm"
        >
          <button
            onClick={() => toggle(i)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-semibold text-gray-800 text-base">
              {item.q}
            </span>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
