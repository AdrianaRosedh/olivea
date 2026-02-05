"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CoverLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? false
          : { opacity: 0, y: 10, scale: 0.992, filter: "blur(12px)" }
      }
      animate={reduce ? {} : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={reduce ? undefined : { duration: 0.65, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function BodyLead({
  children,
  className,
  delay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
      animate={reduce ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        reduce ? undefined : { duration: 0.55, delay, ease: EASE }
      }
    >
      {children}
    </motion.div>
  );
}