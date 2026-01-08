'use client';

import { motion } from 'framer-motion';

const services = [
  {
    title: "Connectivity",
    text: "Wi-Fi in all rooms and patios. Paddle court coverage. USB-C and universal outlets throughout.",
  },
  {
    title: "Comfort",
    text: "Blackout curtains, natural airflow, and climate control — every detail to protect your rest.",
  },
  {
    title: "Room Details",
    text: "Filtered water in glass, refillable toiletries, and our own house scent — botanical and balanced.",
  },
  {
    title: "Accessible Options",
    text: "We offer accessible ground-floor rooms on request — no steps, no visual clutter.",
  },
  {
    title: "Concierge",
    text: "Message us anytime via WhatsApp. We’ll help with bookings, transport, or local tips.",
  },
  {
    title: "Local Connection",
    text: "Need a vineyard to visit? We’ll suggest our favorites — from long-table lunches to hidden corners.",
  },
];

export default function ServicesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {services.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="p-5 bg-[#e7eae1] rounded-xl border border-[#dce3db] shadow-sm transition-transform duration-300 ease-out"
        >
          <h3 className="font-semibold text-sm italic text-gray-700 mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed">
            {item.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
