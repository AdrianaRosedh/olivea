"use client";

import { motion } from "framer-motion";

/**
 * Wraps its children in a fade-and-slide animation
 * that triggers when scrolled into view.
 */
export default function AnimatedSection({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}