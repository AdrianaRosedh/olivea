// app/(admin)/admin/login/page.tsx
// ─────────────────────────────────────────────────────────────────────
// Admin login page — email/password or magic link.
// Standalone layout (no dock/sidebar).
// Rich cinematic Framer Motion entrance animations.
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { loginWithEmail, loginWithMagicLink } from "@/lib/auth/actions";

// ── Easing & timing constants ────────────────────────────────────────
const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];
const soft: [number, number, number, number] = [0.4, 0, 0.2, 1];

const HERO_DURATION = 0.8;
const FIELD_DURATION = 0.4;
const FIELD_STAGGER = 0.08;

// ── Variant definitions ──────────────────────────────────────────────

/** Background texture fade-in */
const bgVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.35,
    transition: { duration: 1.0, ease: soft },
  },
};

/** Logo — scale up from 0.8 with blur clearing */
const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: HERO_DURATION, ease: cinematic },
  },
};

/** Card — slides up with spring physics */
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
      mass: 0.8,
      delay: 0.25,
    },
  },
};

/** Staggered form container */
const formContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: FIELD_STAGGER,
      delayChildren: 0.45,
    },
  },
};

/** Individual form field item */
const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: FIELD_DURATION, ease: cinematic },
  },
};

/** Submit button pulse/glow when idle */
const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: FIELD_DURATION, ease: cinematic },
  },
  glow: {
    boxShadow: [
      "0 2px 8px rgba(94,118,88,0.2)",
      "0 2px 20px rgba(94,118,88,0.4)",
      "0 2px 8px rgba(94,118,88,0.2)",
    ],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Footer text */
const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, delay: 0.7, ease: soft },
  },
};

// ── Component ────────────────────────────────────────────────────────

type LoginMode = "password" | "magic-link";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/admin";
  // Prevent open redirect: must start with /admin, no protocol, no double slashes
  const redirect =
    rawRedirect.startsWith("/admin") && !/^\/\/|:\/\//.test(rawRedirect)
      ? rawRedirect
      : "/admin";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(authError === "auth_failed" ? "Authentication failed. Please try again." : "");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      if (mode === "password") {
        const result = await loginWithEmail(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          router.push(redirect);
          router.refresh();
        }
      } else {
        const result = await loginWithMagicLink(email);
        if (result.error) {
          setError(result.error);
        } else {
          setMagicLinkSent(true);
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f5f0] flex items-center justify-center p-4">
      {/* Background texture — fades in */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        variants={bgVariants}
        initial="hidden"
        animate="visible"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(94,118,88,0.03) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo — dramatic entrance: scale + fade + blur */}
        <motion.div
          className="flex flex-col items-center mb-8"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className="w-14 h-14 mb-3"
            style={{
              backgroundColor: "#5e7658",
              WebkitMaskImage: "url(/brand/OliveaFTTIcon.svg)",
              maskImage: "url(/brand/OliveaFTTIcon.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          <h1 className="text-[#2d3b29] text-xl font-semibold">Olivea Admin</h1>
          <p className="text-[#6b7a65] text-sm mt-1">Sign in to manage your site</p>
        </motion.div>

        {/* Login card — slides up with spring */}
        <motion.div
          className="
            bg-white/70 backdrop-blur-xl rounded-2xl p-6
            border border-[#5e7658]/[0.08]
            shadow-[0_8px_32px_rgba(94,118,88,0.08)]
          "
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {magicLinkSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#5e7658]/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5e7658" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-[#2d3b29] font-semibold mb-2">Check your email</h2>
              <p className="text-[#6b7a65] text-sm">
                We sent a magic link to <strong className="text-[#2d3b29]">{email}</strong>.
                Click the link to sign in.
              </p>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setEmail("");
                }}
                className="mt-4 text-sm text-[#5e7658] hover:text-[#4a6046] underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Mode toggle — stagger item 1 */}
              <motion.div variants={fieldVariants} className="flex gap-1 p-1 bg-[#f4f5f0] rounded-xl">
                <button
                  type="button"
                  onClick={() => { setMode("password"); setError(""); }}
                  className={`
                    flex-1 text-xs font-medium py-2 rounded-lg transition-all duration-200
                    ${mode === "password"
                      ? "bg-white text-[#2d3b29] shadow-sm"
                      : "text-[#6b7a65] hover:text-[#2d3b29]"
                    }
                  `}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("magic-link"); setError(""); }}
                  className={`
                    flex-1 text-xs font-medium py-2 rounded-lg transition-all duration-200
                    ${mode === "magic-link"
                      ? "bg-white text-[#2d3b29] shadow-sm"
                      : "text-[#6b7a65] hover:text-[#2d3b29]"
                    }
                  `}
                >
                  Magic Link
                </button>
              </motion.div>

              {/* Email — stagger item 2 */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="email" className="block text-xs font-medium text-[#2d3b29] mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@olivea.com"
                  className="
                    w-full px-3 py-2.5 rounded-xl text-sm
                    bg-white border border-[#5e7658]/15
                    text-[#2d3b29] placeholder:text-[#6b7a65]/50
                    focus:outline-none focus:ring-2 focus:ring-[#5e7658]/20 focus:border-[#5e7658]/30
                    transition-all duration-200
                  "
                />
              </motion.div>

              {/* Password (only in password mode) — stagger item 3 */}
              {mode === "password" && (
                <motion.div variants={fieldVariants}>
                  <label htmlFor="password" className="block text-xs font-medium text-[#2d3b29] mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="
                      w-full px-3 py-2.5 rounded-xl text-sm
                      bg-white border border-[#5e7658]/15
                      text-[#2d3b29] placeholder:text-[#6b7a65]/50
                      focus:outline-none focus:ring-2 focus:ring-[#5e7658]/20 focus:border-[#5e7658]/30
                      transition-all duration-200
                    "
                  />
                </motion.div>
              )}

              {/* Error message */}
              {error && (
                <motion.div
                  className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: cinematic }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit — pulse glow when not pending */}
              <motion.button
                type="submit"
                disabled={isPending}
                variants={buttonVariants}
                animate={isPending ? "visible" : "glow"}
                className="
                  w-full py-2.5 rounded-xl text-sm font-medium
                  bg-[#5e7658] text-white
                  hover:bg-[#4a6046] active:bg-[#3d5039]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                {isPending
                  ? "Signing in..."
                  : mode === "password"
                    ? "Sign in"
                    : "Send magic link"
                }
              </motion.button>
            </motion.form>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-[#6b7a65]/60 text-[10px] mt-6 uppercase tracking-widest"
          variants={footerVariants}
          initial="hidden"
          animate="visible"
        >
          Olivea Farm to Table
        </motion.p>
      </div>
    </div>
  );
}
