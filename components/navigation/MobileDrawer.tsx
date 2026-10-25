"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import LocaleSwitcher from "./LocaleSwitcher";
import { markMenuKeepOpen } from "@/lib/menuLanguageSwitch";
import FocusTrap from "focus-trap-react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import type { AppDictionary } from "@/app/[lang]/(main)/dictionaries";

// ✅ SEO: real crawlable <a href> nav that keeps framer-motion stagger.
// Google can't follow onClick handlers — the primary nav must be anchors.
const MotionLink = motion.create(Link);

// Social dock is dynamic so its inline-SVG icon module only loads when the drawer opens.
const MobileDrawerSocialDock = dynamic(
  () => import("./MobileDrawerSocialDock"),
  { ssr: false, loading: () => null }
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "es";
  dict: AppDictionary;
  origin?: { x: number; y: number };

  /**
   * Optional: called when the drawer is FULLY unmounted (after exit animation),
   * perfect moment to refresh AdaptiveNavbar background detection.
   */
  onExitComplete?: () => void;
}

// The circle opens on one deliberate curve (fast out of the button, long
// settle) and closes as its mirror: it draws back into the button, visibly
// shrinking from the first frame and slowing as it lands. (A 0.3 s ease-in
// close held the full sheet still for ~100 ms, then collapsed in the last
// ~100 ms: it read as the menu simply disappearing.) It used to be a soft spring
// (~1 s) growing to 140vmax, past the farthest corner, so a quarter of its
// time happened off screen and it read as slow.
const REVEAL_OPEN = "520ms cubic-bezier(0.32, 0.72, 0, 1)";
const REVEAL_CLOSE = "460ms cubic-bezier(0.5, 0, 0.3, 1)";

const container: Variants = {
  hidden: {},
  // Items follow the edge of the circle in, a beat behind it.
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } },
  exit: { transition: { duration: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MobileDrawer({
  isOpen,
  onClose,
  lang,
  dict,
  origin,
  onExitComplete,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const reduce = usePrefersReducedMotion();
  // Each link fetches its page the moment a finger touches it (a head start
  // of ~100 ms before the tap completes), instead of all thirteen prefetching
  // at once when the menu came into view, which competed with the reveal.
  // prefetch={false} turns Next's automatic prefetch off entirely, and since
  // the menu now stays built, automatic prefetch would otherwise fire for
  // every link on every page load.

  // The shared lock: keeps the page still behind the menu and flags a modal as
  // open, so the Live Garden orb (z-9999) steps aside instead of floating over
  // the menu. It replaces the drawer's own position:fixed lock — with both, the
  // shared lock saved the drawer's `fixed` as the page's style and put it back
  // on close, leaving the page stuck.
  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const tFarm = dict.drawer.main.farmtotable;
  const tCasa = dict.drawer.main.casa;
  const tCafe = dict.drawer.main.cafe;

  const mainLinks = useMemo(
    () => [
      { href: `/${lang}/farmtotable`, label: tFarm },
      { href: `/${lang}/casa`, label: tCasa },
      { href: `/${lang}/cafe`, label: tCafe },
    ],
    [lang, tFarm, tCasa, tCafe]
  );

  const moreLinks = useMemo(() => {
    return [
      { href: `/${lang}/press`, label: lang === "es" ? "Prensa" : "Press" },
      {
        href: `/${lang}/sustainability`,
        label: lang === "es" ? "Filosofía" : "Philosophy",
      },
      { href: `/${lang}/journal`, label: lang === "es" ? "Cuaderno" : "Journal" },
      { href: `/${lang}/team`, label: lang === "es" ? "Equipo" : "Team" },
      {
        href: `/${lang}/contact`,
        label: lang === "es" ? "Contáctanos" : "Contact",
      },
      {
        href: `/${lang}/carreras`,
        label: lang === "es" ? "Carreras" : "Careers",
      },
    ];
  }, [lang]);

  // Progressive enhancement: the items are real <a href> (crawlable + "open in
  // new tab" works), but a normal left-click keeps the drawer's close-then-
  // navigate animation. Modified clicks (⌘/ctrl/shift/alt, middle) fall through.
  const handleAnchorClick = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    window.navigator.vibrate?.(10);
    onClose();
    window.setTimeout(() => router.push(href), 90);
  };

  const rightsText =
    lang === "en" ? "All rights reserved." : "Todos los derechos reservados.";

  const ox =
    origin?.x ??
    (typeof window !== "undefined" ? window.innerWidth * 0.92 : 360);
  const oy = origin?.y ?? 40;

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  // The circle grows exactly to the farthest corner from the button, in px.
  // (It animated from 0px to 140vmax: two units in one value don't blend
  // cleanly, one source of the glitch.)
  const reach =
    typeof window !== "undefined"
      ? Math.ceil(
          Math.hypot(
            Math.max(ox, window.innerWidth - ox),
            Math.max(oy, window.innerHeight - oy)
          )
        ) + 4
      : 1200;

  // The menu is built once and stays built; opening only moves the circle.
  // It used to be mounted on every tap (~70 elements, the focus trap, the
  // social icons) right as the circle started, and the first frames of the
  // reveal were lost to that work: on a phone the circle seemed to jump open.
  //
  // Closed, it is hidden (visibility) and inert: no touch, focus or reader.
  // Visibility is set by React in the same render that opens it, because the
  // focus trap activates in that render and needs something focusable; left
  // to the animation, the menu was still hidden and the trap threw. It hides
  // again only after the closing animation has finished.
  // Warm the menu's fonts once the page has settled. Hidden text never asks
  // for its font, so the first opening downloaded one mid-reveal (Inter, for
  // the small links) and laid the text out again when it arrived.
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const faces = new Set<string>();
      panel.querySelectorAll<HTMLElement>("a, button, span, p").forEach((el) => {
        const cs = getComputedStyle(el);
        faces.add(`${cs.fontStyle} ${cs.fontWeight} 16px ${cs.fontFamily}`);
      });
      faces.forEach((f) => void document.fonts.load(f).catch(() => {}));
    }, 1500);
    return () => window.clearTimeout(t);
  }, []);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [closeDone, setCloseDone] = useState(true);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) setCloseDone(false);
  }
  const visibility: "visible" | "hidden" = isOpen || !closeDone ? "visible" : "hidden";

  return (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label={lang === "es" ? "Cerrar menú" : "Close menu"}
            tabIndex={isOpen ? 0 : -1}
            initial={{ opacity: 0 }}
            animate={
              isOpen
                ? { opacity: 0.45, transition: { duration: 0.3 } }
                : { opacity: 0, transition: { duration: 0.25 } }
            }
            style={{ visibility }}
            onClick={onClose}
            className={["fixed inset-0 bg-black z-998", isOpen ? "" : "pointer-events-none"].join(" ")}
          />

          <FocusTrap
            active={isOpen}
            focusTrapOptions={{
              allowOutsideClick: true,
              escapeDeactivates: true,
              // Never throw: an empty trap took the whole page down to the
              // error screen. Worst case, focus rests on the menu itself.
              fallbackFocus: () =>
                document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]') ?? document.body,
            }}
          >
            <div className="fixed inset-0 z-999 pointer-events-none">
              <div
                ref={panelRef}
                // The circle is a CSS transition, not a script-driven animation.
                // A transition's clock starts when the browser first draws the
                // change, so the circle always begins from the button. The
                // script timer started at React's commit, and whatever ran
                // before the first frame (30–80 ms here, more on a phone) ate
                // the start: the circle appeared already ~180 px wide.
                onTransitionEnd={(e) => {
                  if (e.target !== e.currentTarget || isOpen) return;
                  // Only the end of the CLOSE counts. The opening's own end can
                  // arrive just after a close has started (close soon after
                  // opening, or a busy phone); taken as "closed", it hid the
                  // panel at once and the menu simply disappeared.
                  const cs = getComputedStyle(e.currentTarget);
                  const finished = reduce
                    ? cs.opacity === "0"
                    : /^circle\(0px/.test(cs.clipPath);
                  if (!finished) return;
                  setCloseDone(true);
                  onExitComplete?.();
                  window.dispatchEvent(new Event("olivea:drawer-exit"));
                }}
                inert={!isOpen}
                style={{
                  visibility,
                  ...(reduce
                    ? { opacity: isOpen ? 1 : 0, transition: `opacity ${isOpen ? 200 : 150}ms ease` }
                    : {
                        clipPath: `circle(${isOpen ? reach : 0}px at ${ox}px ${oy}px)`,
                        transition: isOpen ? `clip-path ${REVEAL_OPEN}` : `clip-path ${REVEAL_CLOSE}`,
                        // Its own compositing layer while open AND while closing.
                        // Dropping it in the same instant the closing transition
                        // started made WebKit (every iPhone) paint the end state
                        // at once: the menu vanished instead of drawing back in.
                        willChange: visibility === "visible" ? "clip-path" : "auto",
                      }),
                }}
                className="absolute inset-0 pointer-events-auto overflow-hidden"
                aria-modal="true"
                role="dialog"
                tabIndex={-1}
                aria-label={lang === "es" ? "Menú" : "Menu"}
              >
                {/* Background layers */}
                <div className="absolute inset-0 bg-(--olivea-olive)" />
                <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/25 opacity-80" />
                <div className="absolute inset-0 ring-1 ring-white/10" />

                <motion.div
                  variants={container}
                  initial="hidden"
                  // Closing is the opening in reverse: the links stay put and
                  // the circle draws back over them into the button. They reset
                  // (unseen) once it has closed, ready to come in again. Fading
                  // them at once left a blank olive sheet shrinking.
                  animate={isOpen || !closeDone ? "visible" : "hidden"}
                  // Scrolls on short screens (iPhone SE): the language switcher and
                  // social links used to sit below the bottom edge, out of reach.
                  data-lenis-prevent
                  className="relative h-full w-full flex flex-col px-6 pb-10 pt-20 pwa-safe-top pwa-safe-bottom overflow-y-auto overscroll-contain"
                >
                  {/* Main links */}
                  <div className="flex flex-col gap-3">
                    {mainLinks.map(({ href, label }) => {
                      const active = isActive(href);
                      return (
                        <MotionLink
                          key={href}
                          href={href}
                          prefetch={false}
                          onPointerDown={() => router.prefetch(href)}
                          variants={item}
                          onClick={(e) => handleAnchorClick(e, href)}
                          aria-current={active ? "page" : undefined}
                          className={[
                                                        "w-full rounded-2xl px-6 py-4 text-left",
                            "ring-1",
                            "transition-colors duration-200",
                            "flex items-center justify-between",
                            "active:scale-[0.99] transition-transform duration-150",
                            "uppercase tracking-[0.14em] text-(--olivea-cream)",
                            active
                              ? "bg-white/16 ring-white/25"
                              : "bg-white/10 ring-white/15 hover:bg-white/12",
                          ].join(" ")}
                        >
                          <span className="text-base font-semibold">{label}</span>
                          <span
                            aria-hidden="true"
                            className={
                              active
                                ? "text-(--olivea-cream)"
                                : "text-(--olivea-cream)/60"
                            }
                          >
                            {/* Refined thin diagonal arrow — replaces the Unicode ↗ glyph
                                which rendered too heavy from the body font. */}
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 10 L10 4" />
                              <path d="M5.5 4 L10 4 L10 8.5" />
                            </svg>
                          </span>
                        </MotionLink>
                      );
                    })}
                  </div>

                  <motion.div variants={item} className="mt-5">
                    <div className="h-px w-full bg-white/10" />
                  </motion.div>

                  {/* More links */}
                  <motion.div variants={item} className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {moreLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            prefetch={false}
                            onPointerDown={() => router.prefetch(href)}
                            onClick={(e) => handleAnchorClick(e, href)}
                            aria-current={active ? "page" : undefined}
                            className={[
                                                            "rounded-2xl px-4 py-3 text-sm text-left",
                                "ring-1",
                              "transition-colors duration-200",
                              "active:scale-[0.99] transition-transform duration-150",
                              "text-(--olivea-cream)",
                              active
                                ? "bg-white/12 ring-white/20"
                                : "bg-white/6 ring-white/10 hover:bg-white/10",
                            ].join(" ")}
                          >
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Innovation — featured, full-width */}
                  <motion.div variants={item} className="mt-3">
                    <Link
                      href={`/${lang}/innovation`}
                      prefetch={false}
                      onPointerDown={() => router.prefetch(`/${lang}/innovation`)}
                      onClick={(e) => handleAnchorClick(e, `/${lang}/innovation`)}
                      aria-current={isActive(`/${lang}/innovation`) ? "page" : undefined}
                      className={[
                        "block w-full",
                        "rounded-2xl px-5 py-4 text-sm text-left",
                        "ring-1 transition-colors duration-200",
                        "active:scale-[0.99] transition-transform duration-150",
                        "text-(--olivea-cream)",
                        isActive(`/${lang}/innovation`)
                          ? "bg-white/12 ring-white/20"
                          : "bg-white/6 ring-white/10 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="uppercase tracking-[0.18em]">
                          {lang === "es" ? "Innovación" : "Innovation"}
                        </span>
                        <span aria-hidden="true" className="text-(--olivea-cream)/50">
                          →
                        </span>
                      </span>
                    </Link>
                  </motion.div>

                  <div className="flex-1 min-h-6" />

                  {/* Footer */}
                  <div className="flex flex-col items-center gap-4 pb-2">
                    <motion.div
                      variants={item}
                    >
                      <LocaleSwitcher currentLang={lang} tone="dark" className="text-[15px]" onSwitch={markMenuKeepOpen} />
                    </motion.div>

                    {/* Social icons are dynamic → only load when drawer opens. */}
                    <motion.div
                      variants={item}
                    >
                      <MobileDrawerSocialDock lang={lang} />
                    </motion.div>

                    {/* Everything the desktop footer offers: Legal, the cookie
                        choice and roseiies sat only on desktop (Legal was
                        reachable here only by tapping the copyright). */}
                    <motion.nav
                      variants={item}
                      aria-label={lang === "es" ? "Información legal" : "Legal information"}
                      className="flex items-center justify-center gap-5 text-[13px] text-(--olivea-shell)"
                    >
                      <Link
                        href={`/${lang}/legal`}
                        prefetch={false}
                        onPointerDown={() => router.prefetch(`/${lang}/legal`)}
                        onClick={(e) => handleAnchorClick(e, `/${lang}/legal`)}
                        className="opacity-85 hover:opacity-100 underline-offset-4 hover:underline"
                      >
                        {dict.footer.legal}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          // Close first so the consent choice opens on the page,
                          // not underneath the menu.
                          onClose();
                          window.setTimeout(() => window.dispatchEvent(new Event("olivea:cookie-prefs")), 160);
                        }}
                        className="opacity-85 hover:opacity-100 underline-offset-4 hover:underline"
                      >
                        Cookies
                      </button>
                      <Link
                        href={`/${lang}/roseiies`}
                        prefetch={false}
                        onPointerDown={() => router.prefetch(`/${lang}/roseiies`)}
                        onClick={(e) => handleAnchorClick(e, `/${lang}/roseiies`)}
                        aria-label="roseiies"
                        className="inline-flex items-center opacity-85 hover:opacity-100"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block bg-(--olivea-shell)"
                          style={{
                            height: "1.25em",
                            width: "5.7em",
                            maskImage: "url(/images/roseiies-logo.svg)",
                            WebkitMaskImage: "url(/images/roseiies-logo.svg)",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                          }}
                        />
                      </Link>
                    </motion.nav>

                    <motion.p
                      variants={item}
                      className="text-xs text-(--olivea-shell) opacity-70 text-center"
                    >
                      © {new Date().getFullYear()} Inmobiliaria MYA by DH.
                      <br />
                      {rightsText}
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </div>
          </FocusTrap>
        </>
  );
}