"use client";

import Image from "next/image";
import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
} from "lucide-react";

import OliveaLogo from "@/assets/alebrije-1.svg";

import type {
  Lang,
  LeaderProfile,
  TeamLink,
  I18nText,
} from "@/app/(main)/[lang]/team/teamData";

/* ---------------- helpers ---------------- */

const t = (x: I18nText | undefined, lang: Lang) => (x ? x[lang] : "");
const isExternal = (href: string) => /^https?:\/\//i.test(href);

// Olivea tokens (safe defaults; keep using your CSS vars if you prefer)
const TOK = {
  cream: "#f1f1f1",
  creamSoft: "rgba(241,241,241,0.72)",
  glassBorder: "rgba(255,255,255,0.35)",
};

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------------- motion variants ---------------- */

type MotionPack = {
  container: Variants;
  item: Variants;
  avatar: Variants;
  buttonsWrap: Variants;
};

function makeVariants(reduce: boolean): MotionPack {
  const container: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : 28,
      filter: reduce ? "none" : "blur(14px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: reduce ? 0.1 : 0.75,
        ease: easeOut,
        when: "beforeChildren",
        staggerChildren: reduce ? 0 : 0.07,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : 14,
      filter: reduce ? "none" : "blur(10px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.1 : 0.55, ease: easeOut },
    },
  };

  const avatar: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : 18,
      scale: reduce ? 1 : 0.93,
      filter: reduce ? "none" : "blur(12px)",
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: reduce ? 0.1 : 0.75,
        ease: easeOut,
        delay: reduce ? 0 : 0.05,
      },
    },
  };

  const buttonsWrap: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
  };

  return { container, item, avatar, buttonsWrap };
}

/* ---------------- avatar (modern lens + fallback) ---------------- */

// Modern “soft squircle”
const AVATAR_RADIUS = 34;


function Avatar({
  src,
  alt,
  reduce,
}: {
  src: string;
  alt: string;
  reduce: boolean;
}) {


  return (
    <div className="relative">
      {/* outer glow */}
      <div
        className="absolute -inset-5"
        style={{
          borderRadius: AVATAR_RADIUS,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.0) 60%)",
          filter: "blur(2px)",
          opacity: 0.95,
        }}
      />

      {/* lens ring */}
      <motion.div
        className="absolute -inset-2"
        initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.965 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.1 : 0.6, ease: easeOut }}
        style={{
          borderRadius: AVATAR_RADIUS,
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.42), rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.20))",
          backdropFilter: "blur(18px) saturate(155%)",
          WebkitBackdropFilter: "blur(18px) saturate(155%)",
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.24)",
        }}
      />

      {/* image */}
      <motion.div
        className="relative h-32 w-32 overflow-hidden sm:h-36 sm:w-36"
        initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: reduce ? 0.1 : 0.75,
          ease: easeOut,
          delay: reduce ? 0 : 0.05,
        }}
        style={{
          borderRadius: AVATAR_RADIUS,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="160px"
          className="object-cover"
        />

        {/* initials fallback layer (useful if image is slow/blankish) */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.12), rgba(0,0,0,0.10))",
            color: "rgba(255,255,255,0.80)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.06em",
            fontSize: 18,
            fontWeight: 600,
          }}
          aria-hidden="true"
        >
        </div>

        {/* inner spec highlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.22), rgba(255,255,255,0.0) 58%)",
            mixBlendMode: "screen",
            opacity: 0.9,
          }}
        />

        {/* subtle edge refraction */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 -20px 34px rgba(0,0,0,0.16)",
            borderRadius: AVATAR_RADIUS,
          }}
        />
      </motion.div>
    </div>
  );
}

/* ---------------- socials ---------------- */

type SocialKind =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "facebook"
  | "linkedin"
  | "website";

function detectSocial(href: string): SocialKind | null {
  const h = href.toLowerCase();
  if (h.includes("instagram.com")) return "instagram";
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("youtube.com") || h.includes("youtu.be")) return "youtube";
  if (h.includes("x.com") || h.includes("twitter.com")) return "x";
  if (h.includes("facebook.com")) return "facebook";
  if (h.includes("linkedin.com")) return "linkedin";
  if (h.startsWith("http")) return "website";
  return null;
}

function SocialIcon({ kind }: { kind: SocialKind }) {
  const props = { size: 20, strokeWidth: 1.6 };
  switch (kind) {
    case "instagram":
      return <Instagram {...props} />;
    case "tiktok":
      return <Music2 {...props} />;
    case "youtube":
      return <Youtube {...props} />;
    case "x":
      return <Twitter {...props} />;
    case "facebook":
      return <Facebook {...props} />;
    case "linkedin":
      return <Linkedin {...props} />;
    default:
      return <Globe {...props} />;
  }
}

function SocialRow({
  items,
  reduce,
}: {
  items: Array<{ kind: SocialKind; href: string; label: string }>;
  reduce: boolean;
}) {
  if (!items.length) return null;

  return (
   <div className="flex items-center justify-center gap-1">
    {items.map((it) => (
      <motion.a
        key={`${it.kind}-${it.href}`}
        href={it.href}
        target="_blank"
        rel="noreferrer"
        aria-label={it.label}
        title={it.label}
        className={[
          "group flex h-10 w-10 items-center justify-center rounded-full",
          "transition-all outline-none",
          "focus-visible:ring-2 focus-visible:ring-white/40",
          "hover:bg-white/15 hover:backdrop-blur-md",
        ].join(" ")}
        style={{ color: "#f1f1f1" }}   // ✅ exact Olivea cream
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.95 }}
      >
        <SocialIcon kind={it.kind} />
      </motion.a>
    ))}
  </div>
  );
}

/* ---------------- button ---------------- */

function LinkButton({
  link,
  lang,
  reduce,
  variants,
}: {
  link: TeamLink;
  lang: Lang;
  reduce: boolean;
  variants: Variants;
}) {
  const label = t(link.label, lang);
  const href = link.href;
  const external = isExternal(href);

  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      variants={variants}
      whileHover={reduce ? undefined : { y: -2, scale: 1.01 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      className={[
        "group relative flex w-full items-center justify-center overflow-hidden",
        "rounded-2xl border px-6 py-4",          // ✅ thicker
        "min-h-[58px]",                          // ✅ classic link-in-bio height
        "text-center outline-none",
        "transition-[transform,background-color,border-color] duration-300",
        "focus-visible:ring-2 focus-visible:ring-white/40",
      ].join(" ")}
      style={{
        borderColor: "rgba(255,255,255,0.28)",
        background: "linear-gradient(180deg, rgba(94,118,88,0.22), rgba(94,118,88,0.14))",
        backdropFilter: "blur(14px) saturate(145%)",
        WebkitBackdropFilter: "blur(14px) saturate(145%)",
        boxShadow: "0 14px 34px rgba(0,0,0,0.12)", // ✅ more “button” weight
      }}
    >
      {/* soft hover fill */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.20), rgba(255,255,255,0.10))",
        }}
      />

      {/* subtle sheen (keep it, but not overpowering) */}
      <span
        className="pointer-events-none absolute -left-24 top-0 h-full w-48 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.26), transparent)",
          transform: "skewX(-18deg)",
        }}
      />

      <span
        className="relative text-[16px] font-semibold tracking-tight" // ✅ clearer
        style={{
          color: "#f1f1f1",
          fontFamily: "var(--font-lora)",
        }}
      >
        {label}
      </span>
    </motion.a>
  );
}

/* ---------------- main ---------------- */

export default function LinktreeClient({
  lang,
  member,
}: {
  lang: Lang;
  member: LeaderProfile;
}) {
  const reduce = useReducedMotion();
  const V = makeVariants(!!reduce);

  const role = member.role ? t(member.role, lang) : "";
  const org = member.org ? t(member.org, lang) : "";
  const avatar = member.avatar ?? "/images/team/persona.jpg";

  const { socials, buttons } = useMemo(() => {
    const rawLinks = member.links ?? [];
    const primaryIdx = Math.max(0, rawLinks.findIndex((l) => !!l.highlight));
    const primaryLink = rawLinks[primaryIdx];

    const orderedAll = primaryLink
      ? [primaryLink, ...rawLinks.filter((_, i) => i !== primaryIdx)]
      : rawLinks;

    const socialsAcc: Array<{ kind: SocialKind; href: string; label: string }> =
      [];
    const btnAcc: TeamLink[] = [];

    for (const l of orderedAll) {
      const kind = detectSocial(l.href);
      const label = t(l.label, lang) || l.href;
      if (kind && kind !== "website" && !("forceButton" in l)) {
        socialsAcc.push({ kind, href: l.href, label })
      } else {
        btnAcc.push(l)
      }

    }

    const primaryInButtons =
      primaryLink && btnAcc.some((b) => b.href === primaryLink.href)
        ? primaryLink
        : undefined;

    const finalButtons = primaryInButtons
      ? [primaryInButtons, ...btnAcc.filter((b) => b.href !== primaryInButtons.href)]
      : btnAcc;

    return { socials: socialsAcc, buttons: finalButtons };
  }, [member.links, lang]);

  return (
    <div className="min-h-[100dvh]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/farm/garden6.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* nicer vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 25%, rgba(0,0,0,0.12), rgba(0,0,0,0.34))",
          }}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-md flex-col">
        {/* Back button */}
        <motion.div
          className="absolute left-5 top-8 z-20"
          initial={{
            opacity: 0,
            x: reduce ? 0 : -10,
            filter: reduce ? "none" : "blur(8px)",
          }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: reduce ? 0.1 : 0.45, ease: easeOut }}
        >
          <a
            href={`/${lang}/team`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{
              borderColor: "rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={1.6} />
          </a>
        </motion.div>

        {/* Top photo area */}
        <div style={{ height: "clamp(120px, 18dvh, 220px)" }} />

        {/* Glass panel */}
        <motion.div
          className="relative flex flex-1 flex-col items-center px-5 pb-8 pt-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.28))",
            backdropFilter: "blur(26px) saturate(1.25)",
            WebkitBackdropFilter: "blur(26px) saturate(1.25)",
            borderRadius: "65px 65px 0 0",
            borderTop: `1px solid ${TOK.glassBorder}`,
            boxShadow: "0 -18px 60px rgba(0,0,0,0.18)",
          }}
          variants={V.container}
          initial="hidden"
          animate="show"
        >
          {/* Specular highlight band */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{
              borderRadius: "65px 65px 0 0",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.06) 72%, rgba(255,255,255,0.0))",
              opacity: 0.9,
            }}
          />

          {/* Avatar overlap */}
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[58%]"
            variants={V.avatar}
            initial="hidden"
            animate="show"
          >
            <Avatar src={avatar} alt={member.name} reduce={!!reduce} />
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={V.item}
            className="mt-2 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-lora)", color: TOK.cream }}
          >
            {member.name}
          </motion.h1>

          {/* Role & Org */}
          {(role || org) && (
            <motion.div
              variants={V.item}
              className="mt-4 text-center"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {role && (
                <div
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: TOK.cream }}
                >
                  {role}
                </div>
              )}

              {org && (
                <div
                  className="mt-1 text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(241,241,241,0.75)" }}
                >
                  {org}
                </div>
              )}
            </motion.div>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <motion.div variants={V.item} className="mt-3">
              <SocialRow items={socials} reduce={!!reduce} />
            </motion.div>
          )}

          {/* Buttons */}
          <motion.div
            variants={V.buttonsWrap}
            className="mt-3 flex w-full max-w-sm flex-col gap-3"
          >
            {buttons.map((link) => (
              <LinkButton
                key={link.href}
                link={link}
                lang={lang}
                reduce={!!reduce}
                variants={V.item}
              />
            ))}
          </motion.div>

          {/* Footer */}
          <motion.footer variants={V.item} className="mt-auto pt-12 text-center">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{
                color: "rgba(241,241,241,0.55)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {lang === "es" ? "Hecho por" : "Made by"}
            </p>
            <div className="mx-auto mt-2 h-7 w-28 opacity-80">
              <OliveaLogo className="h-full w-full" aria-label="Olivea" />
            </div>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
}