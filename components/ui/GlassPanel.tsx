// components/ui/GlassPanel.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A frosted-glass panel that blurs whatever’s behind it,
 * animating its blur on entry.
 */
export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <motion.div
      // core glass styling
      className={`
        relative
        bg-white/70 border border-white/30
        shadow-2xl
        backdrop-blur-md
        overflow-hidden
        rounded-2xl
        ${className}
      `}
      // animate blur on mount/unmount
      initial={{ backdropFilter: "blur(0px)" }}
      animate={{ backdropFilter: "blur(16px)" }}
      exit={{ backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        // some browsers need the vendor prefix inline
        WebkitBackdropFilter: "blur(16px)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* your content stays on top */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}