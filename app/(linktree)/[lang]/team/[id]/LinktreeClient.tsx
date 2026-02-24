// app/(linktree)/[lang]/team/[id]/LinktreeClient.tsx
"use client";


import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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
 ArrowUpRight,
} from "lucide-react";

import type {
 Lang,
 LeaderProfile,
 TeamLink,
 I18nText,
} from "@/app/(main)/[lang]/team/teamData";


/* ---------------- helpers ---------------- */


const t = (x: I18nText | undefined, lang: Lang) => (x ? x[lang] : "");
const isExternal = (href: string) => /^https?:\/\//i.test(href);


const TOK = {
 cream: "#f1f1f1",
 glassBorder: "rgba(255,255,255,0.35)",
};


const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];


function hasForceButton(x: unknown): x is { forceButton: true } {
 if (!x || typeof x !== "object") return false;
 const o = x as Record<string, unknown>;
 return o.forceButton === true;
}


/* ---------------- motion variants ---------------- */


type MotionPack = {
 container: Variants;
 item: Variants;
 avatar: Variants;
 buttonsWrap: Variants;
};


function makeVariants(reduce: boolean): MotionPack {
 const container: Variants = {
   hidden: { opacity: 0, y: reduce ? 0 : 18 },
   show: {
     opacity: 1,
     y: 0,
     transition: {
       duration: reduce ? 0.1 : 0.55,
       ease: easeOut,
       when: "beforeChildren",
       staggerChildren: reduce ? 0 : 0.06,
       delayChildren: reduce ? 0 : 0.08,
     },
   },
 };


 const item: Variants = {
   hidden: { opacity: 0, y: reduce ? 0 : 10 },
   show: {
     opacity: 1,
     y: 0,
     transition: { duration: reduce ? 0.1 : 0.45, ease: easeOut },
   },
 };


 const avatar: Variants = {
   hidden: { opacity: 0, y: reduce ? 0 : 14, scale: reduce ? 1 : 0.97 },
   show: {
     opacity: 1,
     y: 0,
     scale: 1,
     transition: {
       duration: reduce ? 0.1 : 0.55,
       ease: easeOut,
       delay: reduce ? 0 : 0.05,
     },
   },
 };


 const buttonsWrap: Variants = {
   hidden: {},
   show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
 };


 return { container, item, avatar, buttonsWrap };
}


/* ---------------- avatar ---------------- */


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
   <div className="relative isolate">
     {/* Back glow (always behind) */}
     <div
       className="pointer-events-none absolute -inset-5"
       style={{
         zIndex: 0,
         borderRadius: AVATAR_RADIUS,
         background:
           "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.0) 60%)",
         filter: "blur(2px)",
         opacity: 0.95,
       }}
     />


     {/* Glass frame (behind image, not on top) */}
     <motion.div
       className="pointer-events-none absolute -inset-2"
       initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.965 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: reduce ? 0.1 : 0.6, ease: easeOut }}
       style={{
         zIndex: 1,
         borderRadius: AVATAR_RADIUS,
         background:
           "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.42), rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.20))",
         backdropFilter: "blur(18px) saturate(155%)",
         WebkitBackdropFilter: "blur(18px) saturate(155%)",
         border: "1px solid rgba(255,255,255,0.35)",
         boxShadow: "0 18px 60px rgba(0,0,0,0.24)",
       }}
     />


     {/* Image (always on top of frame) */}
     <motion.div
       className="relative z-10 h-32 w-32 overflow-hidden sm:h-36 sm:w-36"
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


       {/* subtle vignette (no top haze) */}
       <div
         className="pointer-events-none absolute inset-0"
         style={{
           background:
             "linear-gradient(to bottom, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.10) 65%, rgba(0,0,0,0.18) 100%)",
         }}
       />


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


// ✅ Only treat as a social icon when label is the generic platform name.
// If label is “Instagram Olivea”, “Fritanguita”, etc. -> render as a normal button.
function isGenericPlatformLabel(label: string, kind: SocialKind): boolean {
 const s = label.trim().toLowerCase();


 const aliases: Record<SocialKind, string[]> = {
   instagram: ["instagram", "ig"],
   tiktok: ["tiktok", "tik tok"],
   youtube: ["youtube", "yt"],
   x: ["x", "twitter"],
   facebook: ["facebook", "fb"],
   linkedin: ["linkedin"],
   website: ["website", "sitio", "sitio web", "web"],
 };


 return (aliases[kind] ?? []).includes(s);
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
           "transition-all outline-none transform-gpu",
           "focus-visible:ring-2 focus-visible:ring-white/40",
           "hover:bg-white/15 hover:backdrop-blur-md",
         ].join(" ")}
         style={{ color: TOK.cream }}
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
     whileHover={reduce ? undefined : { y: -2, scale: 1.015 }}
     whileTap={reduce ? undefined : { scale: 0.975 }}
     className={[
       "group relative flex w-full items-center justify-center overflow-hidden",
       "rounded-2xl border px-6 py-4",
       "min-h-14.5",
       "text-center outline-none transform-gpu",
       "transition-[transform,background-color,border-color] duration-300",
       "focus-visible:ring-2 focus-visible:ring-white/40",
     ].join(" ")}
     style={{
       borderColor: "rgba(255,255,255,0.28)",
       background:
         "linear-gradient(180deg, rgba(94,118,88,0.22), rgba(94,118,88,0.14))",
       backdropFilter: "blur(14px) saturate(145%)",
       WebkitBackdropFilter: "blur(14px) saturate(145%)",
       boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
     }}
   >
     <span
       className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
       style={{
         background:
           "linear-gradient(180deg, rgba(255,255,255,0.20), rgba(255,255,255,0.10))",
       }}
     />
     <span
       className="pointer-events-none absolute -left-24 top-0 h-full w-48 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
       style={{
         background:
           "linear-gradient(90deg, transparent, rgba(255,255,255,0.26), transparent)",
         transform: "skewX(-18deg)",
       }}
     />


     {/* ✅ Centered label that never shifts (arrow is absolutely positioned) */}
     <span
       className="relative flex w-full items-center justify-center text-[16px] font-semibold tracking-tight"
       style={{
         color: TOK.cream,
         fontFamily: "var(--font-lora)",
       }}
     >
       <span className="px-8 text-center">{label}</span>


       {external && (
         <ArrowUpRight
           className="absolute right-5 opacity-0 transition-opacity duration-200 group-hover:opacity-90"
           size={18}
           strokeWidth={1.6}
           aria-hidden="true"
         />
       )}
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


 const [bgReady, setBgReady] = useState(false);
 const bgReadyOnce = useRef(false);


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


     const forcedButton = hasForceButton(l);


     const shouldBeSocialIcon =
       !!kind &&
       kind !== "website" &&
       !forcedButton &&
       isGenericPlatformLabel(label, kind);


     if (shouldBeSocialIcon) {
       socialsAcc.push({ kind: kind as SocialKind, href: l.href, label });
     } else {
       btnAcc.push(l);
     }
   }


   const primaryInButtons =
     primaryLink && btnAcc.some((b) => b.href === primaryLink.href)
       ? primaryLink
       : undefined;


   const finalButtons = primaryInButtons
     ? [
         primaryInButtons,
         ...btnAcc.filter((b) => b.href !== primaryInButtons.href),
       ]
     : btnAcc;


   return { socials: socialsAcc, buttons: finalButtons };
 }, [member.links, lang]);


 return (
   <div className="min-h-dvh">
     {/* Ultra-fast base paint */}
     <div className="fixed-lcp" aria-hidden="true" />


     {/* Background */}
     <div className="fixed inset-0 z-0">
       <div
         className="absolute inset-0"
         style={{ background: "var(--olivea-olive)" }}
         aria-hidden="true"
       />


       {/* ✅ Perf: keep the blur as the only "priority" image (fast LCP),
           let the hi-res fade in without competing for priority. */}
       <div
         className="absolute inset-0 transition-opacity duration-500 will-change-[opacity]"
         style={{ opacity: bgReady ? 0 : 1, pointerEvents: "none" }}
         aria-hidden="true"
       >
         <Image
           src="/images/linktree/gardenleaves-blur.jpg"
           alt=""
           fill
           priority
           sizes="100vw"
           quality={35}
           className="object-cover scale-[1.08]"
           style={{ objectPosition: "center", transform: "translateZ(0)" }}
         />
       </div>


       <div
         className="absolute inset-0 transition-opacity duration-700 will-change-[opacity]"
         style={{ opacity: bgReady ? 1 : 0, pointerEvents: "none" }}
         aria-hidden="true"
       >
         <Image
           src="/images/linktree/gardenleaves.avif"
           alt=""
           fill
           // ✅ Perf: remove priority here
           sizes="100vw"
           quality={60}
           className="object-cover"
           style={{ objectPosition: "center", transform: "translateZ(0)" }}
           onLoadingComplete={() => {
             if (bgReadyOnce.current) return;
             bgReadyOnce.current = true;
             setBgReady(true);
           }}
         />
       </div>


       <div
         className="absolute inset-0"
         style={{
           background:
             "radial-gradient(circle at 50% 25%, rgba(0,0,0,0.10), rgba(0,0,0,0.42))",
         }}
         aria-hidden="true"
       />
     </div>


     {/* Grain overlay */}
     <div
       className="pointer-events-none fixed inset-0 z-2 opacity-[0.06] mix-blend-overlay"
       style={{
         backgroundImage: "url(/images/ui/noise.png)",
         backgroundRepeat: "repeat",
       }}
       aria-hidden="true"
     />


     <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col">
       <motion.div
         className="sticky top-6 z-20 self-start pl-5"
         initial={{ opacity: 0, x: reduce ? 0 : -10 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: reduce ? 0.1 : 0.45, ease: easeOut }}
       >
         <Link
           href={`/${lang}/team`}
           className="inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/40 transform-gpu"
           style={{
             borderColor: "rgba(255,255,255,0.25)",
             background: "rgba(255,255,255,0.10)",
             color: "rgba(255,255,255,0.88)",
             backdropFilter: "blur(14px)",
             WebkitBackdropFilter: "blur(14px)",
           }}
           aria-label="Back"
           prefetch
         >
           <ArrowLeft size={18} strokeWidth={1.6} />
         </Link>
       </motion.div>


       <motion.div
         className="relative mt-24 flex min-h-dvh flex-col items-center px-5 pb-10 pt-10"
         style={{
           background:
             "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.24))",
           backdropFilter: "blur(18px) saturate(1.15)",
           WebkitBackdropFilter: "blur(18px) saturate(1.15)",
           borderRadius: "65px 65px 0 0",
           borderTop: `1px solid ${TOK.glassBorder}`,
           boxShadow: "0 -16px 50px rgba(0,0,0,0.18)",
           transform: "translateZ(0)",
           willChange: "transform",
           isolation: "isolate",
         }}
         variants={V.container}
         initial="hidden"
         animate="show"
       >
         <div
           className="pointer-events-none absolute inset-x-0 top-0 h-24"
           style={{
             borderRadius: "65px 65px 0 0",
             background:
               "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.06) 72%, rgba(255,255,255,0.0))",
             opacity: 0.9,
           }}
           aria-hidden="true"
         />


         {/* Avatar overlap */}
         <motion.div variants={V.avatar} className="-mt-30 sm:-mt-33">
           <Avatar src={avatar} alt={member.name} reduce={!!reduce} />
         </motion.div>


         <motion.h1
           variants={V.item}
           className="mt-6 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
           style={{ fontFamily: "var(--font-lora)", color: TOK.cream }}
         >
           {member.name}
         </motion.h1>


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


         {socials.length > 0 && (
           <motion.div variants={V.item} className="mt-1">
             <SocialRow items={socials} reduce={!!reduce} />
           </motion.div>
         )}


         <motion.div
           variants={V.buttonsWrap}
           className="mt-2 flex w-full max-w-sm flex-col gap-3"
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


         <motion.footer variants={V.item} className="mt-10 pb-6 text-center">
           <p
             className="text-[10px] uppercase tracking-widest"
             style={{
               color: "rgba(241,241,241,0.55)",
               fontFamily: "var(--font-sans)",
             }}
           >
             {lang === "es" ? "Hecho por" : "Made by"}
           </p>
           <div className="mx-auto mt-2 h-7 w-28 opacity-80 relative">
            <Image
              src="/brand/alebrije-1.svg"
              alt="Olivea"
              fill
              sizes="112px"
              className="object-contain"
              priority={false}
            />
          </div>
         </motion.footer>
       </motion.div>
     </div>
   </div>
 );
}