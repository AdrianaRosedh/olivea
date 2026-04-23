"use client";

import { motion } from "framer-motion";
import { useDock } from "./AdminDockContext";
import AdminHeader from "./AdminHeader";
import PageTransition from "./PageTransition";

export default function AdminContent({ children }: { children: React.ReactNode }) {
  const { expanded } = useDock();

  return (
    <motion.div
      animate={{ marginLeft: expanded ? 200 : 72 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="relative"
    >
      <AdminHeader />
      <main className="p-8">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </motion.div>
  );
}
