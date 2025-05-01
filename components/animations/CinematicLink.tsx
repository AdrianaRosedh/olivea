"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";

interface Props {
  href: string;
  children: ReactNode;
}

export default function CinematicLink({ href, children }: Props) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setExiting(true);
    // after animation, navigate
    setTimeout(() => {
      router.push(href);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {exiting && (
          <motion.div
            key="overlay"
            initial={{ top: 0, left: 0, width: "100vw", height: "100vh" }}
            animate={{
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "#000",
              opacity: 1,
              borderRadius: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>

      <div onClick={handleClick} style={{ cursor: "pointer" }}>
        {children}
      </div>
    </>
  );
}