"use client";

/**
 * FramerClient.tsx
 * Client-side shim to re-export only the named Framer Motion APIs you need,
 * avoiding Next.js "export *" restrictions in client components.
 */
export { motion, useScroll, useTransform } from "framer-motion";