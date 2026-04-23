"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileText,
  Layers,
  Settings,
  Users,
} from "lucide-react";
import { getDashboardData, type DashboardData } from "@/lib/admin/dashboard-stats";

/* ─── Quick actions — mirrors the AdminDock navigation ─── */
const quickActions = [
  { label: "Pages", href: "/admin/pages", icon: "pages" },
  { label: "Content hub", href: "/admin/content-hub", icon: "content" },
  { label: "Site settings", href: "/admin/site-settings", icon: "settings" },
  { label: "Team", href: "/admin/team", icon: "team" },
] as const;

/* ─── Cinematic easing curves ─── */
const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];
const cinematicSlow: [number, number, number, number] = [0.16, 1, 0.3, 1];
const cinematicSnap: [number, number, number, number] = [0.33, 1, 0.42, 1];

/* ─── Shared motion variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: cinematic },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.65, ease: cinematic },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: cinematicSlow },
  },
};

const sectionFade: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: cinematicSlow },
  },
};

/* ─── Icon map — matches AdminDock categories ─── */
const iconMap: Record<string, React.ElementType> = {
  pages: FileText,
  content: Layers,
  settings: Settings,
  team: Users,
};

/* ─── Stat card ─── */
function StatCard({
  label,
  value,
  change,
  trend,
  loading,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 8px 30px rgba(94,118,88,0.10)",
        transition: { duration: 0.35, ease: cinematicSnap },
      }}
      whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      className="
        relative overflow-hidden rounded-2xl
        bg-white/60 backdrop-blur-sm
        border border-[var(--olivea-olive)]/[0.06]
        p-6 group cursor-default
        transition-colors duration-300
      "
    >
      {/* Soft glow accent */}
      <motion.div
        className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--olivea-cream)] rounded-full blur-2xl"
        initial={{ opacity: 0.3, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: cinematicSlow }}
      />

      <div className="text-[var(--olivea-clay)] text-xs font-medium uppercase tracking-wider">
        {label}
      </div>
      <motion.div
        className="mt-2 text-3xl font-semibold text-[var(--olivea-ink)] tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: cinematic }}
      >
        {loading ? (
          <div className="h-9 w-16 rounded-lg bg-[var(--olivea-cream)]/60 animate-pulse" />
        ) : (
          value
        )}
      </motion.div>
      {change && !loading && (
        <motion.div
          className="mt-2 flex items-center gap-1.5 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35, ease: cinematic }}
        >
          {trend === "up" && <TrendingUp size={12} className="text-[var(--olivea-olive)]" />}
          {trend === "down" && <TrendingDown size={12} className="text-red-500/70" />}
          <span className={
            trend === "up" ? "text-[var(--olivea-olive)]" :
            trend === "down" ? "text-red-500/70" :
            "text-[var(--olivea-clay)]"
          }>
            {change}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Quick action card ─── */
function QuickActionCard({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: string;
}) {
  const Icon = iconMap[icon] ?? FileText;

  return (
    <motion.div variants={slideInLeft}>
      <motion.div
        whileHover={{
          x: 4,
          transition: { duration: 0.3, ease: cinematicSnap },
        }}
      >
        <Link
          href={href}
          className="
            flex items-center gap-4 rounded-2xl p-4
            bg-white/40 backdrop-blur-sm
            border border-[var(--olivea-olive)]/[0.05]
            hover:bg-white/70 hover:border-[var(--olivea-olive)]/[0.1]
            hover:shadow-[0_4px_16px_rgba(94,118,88,0.06)]
            transition-all duration-300 group
          "
        >
          <motion.div
            className="
              w-10 h-10 rounded-xl
              bg-[var(--olivea-cream)]/60
              border border-[var(--olivea-olive)]/[0.08]
              flex items-center justify-center
              group-hover:bg-[var(--olivea-cream)]
              transition-all
            "
            whileHover={{
              rotate: 6,
              scale: 1.1,
              transition: { duration: 0.3, ease: cinematicSnap },
            }}
          >
            <Icon size={18} className="text-[var(--olivea-olive)]" />
          </motion.div>
          <span className="text-sm text-[var(--olivea-ink)]/70 group-hover:text-[var(--olivea-ink)] transition-colors flex-1">
            {label}
          </span>
          <motion.span
            className="inline-flex"
            whileHover={{ x: 3, transition: { duration: 0.2 } }}
          >
            <ArrowRight size={14} className="text-[var(--olivea-olive)]/20 group-hover:text-[var(--olivea-olive)]/50 transition-colors" />
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── Activity item ─── */
function ActivityRow({
  user,
  action,
  target,
  timestamp,
  index,
}: {
  user: string;
  action: string;
  target: string;
  timestamp: string;
  index: number;
}) {
  const actionColors: Record<string, string> = {
    updated: "bg-blue-50 text-blue-600 border-blue-100",
    edited: "bg-amber-50 text-amber-600 border-amber-100",
    published: "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)]/10",
    uploaded: "bg-purple-50 text-purple-600 border-purple-100",
    active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    managed: "bg-sky-50 text-sky-600 border-sky-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.5 + index * 0.08,
        duration: 0.55,
        ease: cinematic,
      }}
      whileHover={{
        backgroundColor: "rgba(94,118,88,0.02)",
        transition: { duration: 0.25 },
      }}
      className="flex items-start gap-3 py-3.5 px-2 -mx-2 rounded-lg border-b border-[var(--olivea-olive)]/[0.04] last:border-0"
    >
      <motion.div
        className="w-7 h-7 rounded-full bg-[var(--olivea-cream)]/80 flex items-center justify-center flex-shrink-0 mt-0.5"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.6 + index * 0.08,
          duration: 0.5,
          ease: cinematicSnap,
        }}
      >
        <span className="text-[10px] font-bold text-[var(--olivea-olive)]">
          {user.charAt(0)}
        </span>
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--olivea-ink)]/70">
          <span className="text-[var(--olivea-ink)] font-medium">{user}</span>
          {" "}
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${actionColors[action] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
            {action}
          </span>
          {" "}
          {target}
        </div>
        <div className="text-xs text-[var(--olivea-clay)] mt-1">{timestamp}</div>
      </div>
    </motion.div>
  );
}

/* ─── Dashboard page ─── */
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // Check for permission error in URL (from requireRole redirect)
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const permissionError = params?.get("error") === "insufficient_permissions";

  const stats = data?.stats ?? [
    { label: "Journal posts", value: "—" },
    { label: "Team members", value: "—" },
    { label: "Pages managed", value: "—" },
    { label: "Job openings", value: "—" },
  ];

  const activity = data?.recentActivity ?? [];

  return (
    <motion.div
      className="max-w-6xl space-y-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
        },
      }}
    >
      {/* Permission error banner */}
      {permissionError && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: cinematic }}
          className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800"
        >
          <strong>Access denied</strong> — you don&apos;t have permission to view that page. Contact your admin to request access.
        </motion.div>
      )}

      {/* Stats — staggered scale-in */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </motion.div>

      {/* Two-column layout — staggered sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        variants={sectionFade}
      >
        {/* Quick actions */}
        <motion.div
          className="lg:col-span-2 space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-xs font-semibold text-[var(--olivea-clay)] uppercase tracking-wider mb-4"
            variants={fadeUp}
          >
            Quick actions
          </motion.h2>
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3, ease: cinematicSlow }}
        >
          <motion.h2
            className="text-xs font-semibold text-[var(--olivea-clay)] uppercase tracking-wider mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: cinematic }}
          >
            Site overview
          </motion.h2>
          <motion.div
            className="rounded-2xl bg-white/50 backdrop-blur-sm border border-[var(--olivea-olive)]/[0.05] p-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.4, ease: cinematic }}
            whileHover={{
              borderColor: "rgba(94,118,88,0.1)",
              transition: { duration: 0.3 },
            }}
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--olivea-cream)]/60 animate-pulse" />
                    <div className="flex-1 h-4 rounded bg-[var(--olivea-cream)]/40 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : activity.length > 0 ? (
              activity.map((item, i) => (
                <ActivityRow key={item.id} {...item} index={i} />
              ))
            ) : (
              <p className="text-sm text-[var(--olivea-clay)] text-center py-6">
                No activity yet. Start by adding content to your site.
              </p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
