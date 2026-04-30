"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Video,
  UtensilsCrossed,
  Home,
  Coffee,
  Mail,
  Leaf,
  Newspaper,
  Briefcase,
  Scale,
  Users,
  AlertCircle,
  BookOpen,
  Bell,
  Flag,
  HelpCircle,
  Image,
  Globe,
  Menu,
  PanelBottom,
  Megaphone,
  Clock,
  ScrollText,
} from "lucide-react";
import {
  categoryMeta,
  categoryItems,
  type AdminCategory,
  type CategoryItem,
} from "./AdminDockContext";

/* ── Cinematic easing curves ── */
const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];
const smoothOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Staggered card entrance variants (3D perspective + tilt) ── */
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotateX: 8,
    rotateY: -4,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: cinematic,
    },
  },
};

/* ── Parallax-like floating for card icons ── */
const iconFloatVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: smoothOut,
    },
  },
  float: {
    y: [0, -3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut" as const,
    },
  },
};

/* ── Cinematic page entrance for the header ── */
const headerVariants = {
  hidden: { opacity: 0, y: -20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: cinematic,
    },
  },
};

/* ── Icon registry (tree-shakeable) ── */
const iconMap: Record<string, React.ElementType> = {
  Video, UtensilsCrossed, Home, Coffee, Mail, Leaf, Newspaper,
  Briefcase, Scale, Users, AlertCircle,
  BookOpen, Bell, Flag, HelpCircle, Image, Globe, Menu, PanelBottom,
  Megaphone, Clock, FileText, ScrollText,
};

function resolveIcon(name: string): React.ElementType {
  return iconMap[name] ?? FileText;
}

/* ── Individual card ── */
function CategoryCard({ item }: { item: CategoryItem }) {
  const Icon = resolveIcon(item.icon);
  const pathname = usePathname();
  const isCurrentPage = pathname === item.href;

  return (
    <motion.div
      variants={cardVariants}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      whileHover={{
        scale: 1.04,
        rotateX: -2,
        rotateY: 2,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={item.href}
        className={`
          group relative flex flex-col gap-4 rounded-2xl p-6
          border transition-all duration-300
          ${isCurrentPage
            ? "bg-[var(--olivea-olive)]/[0.06] border-[var(--olivea-olive)]/[0.15] shadow-[0_2px_12px_rgba(94,118,88,0.08)]"
            : "bg-white/50 backdrop-blur-sm border-[var(--olivea-olive)]/[0.06] hover:bg-white/80 hover:border-[var(--olivea-olive)]/[0.12] hover:shadow-[0_4px_20px_rgba(94,118,88,0.06)]"
          }
        `}
      >
        {/* Icon with subtle parallax float */}
        <motion.div
          className="
            w-11 h-11 rounded-xl
            bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/[0.08]
            flex items-center justify-center
            group-hover:bg-[var(--olivea-cream)] group-hover:scale-105
            transition-all duration-300
          "
          variants={iconFloatVariants}
          initial="hidden"
          animate="float"
        >
          <Icon size={20} className="text-[var(--olivea-olive)]" />
        </motion.div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--olivea-ink)] group-hover:text-[var(--olivea-olive)] transition-colors">
            {item.label}
          </h3>
          <p className="text-xs text-[var(--olivea-clay)] mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={16}
          className="absolute top-6 right-6 text-[var(--olivea-olive)]/0 group-hover:text-[var(--olivea-olive)]/40 transition-all duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </motion.div>
  );
}

/* ── Category card grid page ── */
export default function CategoryCardGrid({ category }: { category: AdminCategory }) {
  const meta = categoryMeta[category];
  const items = categoryItems[category];

  return (
    <motion.div
      className="max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
      style={{ perspective: 1200 }}
    >
      {/* Header */}
      <motion.div
        variants={headerVariants}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-[var(--olivea-ink)] tracking-tight">
          {meta.label}
        </h1>
        <p className="text-sm text-[var(--olivea-clay)] mt-1">{meta.description}</p>
      </motion.div>

      {/* Card grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={gridContainerVariants}
      >
        {items.map((item) => (
          <CategoryCard key={item.href} item={item} />
        ))}
      </motion.div>
    </motion.div>
  );
}
