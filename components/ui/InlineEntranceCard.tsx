// components/ui/InlineEntranceCard.tsx
"use client";

import Image from "next/image";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  type ComponentType,
  type SVGProps,
  type RefObject,
} from "react";
import { motion, type Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useSharedTransition, type SectionKey } from "@/contexts/SharedTransitionContext";
import { INTRO_DONE_EVENT, isIntroPlaying } from "@/hooks/useIntroAnimation";
import { CASCADE } from "@/lib/introConstants";

/* ========= codec probe (client-only, cached) ========= */
let PREFERS_WEBM: boolean | null = null;
function getPrefersWebm() {
  if (PREFERS_WEBM !== null) return PREFERS_WEBM;
  if (typeof window === "undefined") return false;
  const v = document.createElement("video");
  PREFERS_WEBM = !!v.canPlayType?.('video/webm; codecs="vp9,vorbis"');
  return PREFERS_WEBM;
}

/* ========= requestIdle ========= */
type IdleReqCbDeadline = { didTimeout: boolean; timeRemaining: () => number };
type IdleReqCb = (deadline: IdleReqCbDeadline) => void;
function requestIdle(fn: () => void, timeout = 1200): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: (cb: IdleReqCb, opts?: { timeout?: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(() => fn(), { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, timeout);
  return () => window.clearTimeout(id);
}

/* ========= in-view once ========= */
type IOCallback = (inView: boolean) => void;
let _io: IntersectionObserver | null = null;
const _watch = new Map<Element, IOCallback>();

function ensureObserver() {
  if (_io) return _io;
  _io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const cb = _watch.get(e.target);
        if (cb) cb(e.isIntersecting);
        if (e.isIntersecting) _io?.unobserve(e.target);
      }
    },
    { threshold: 0.1, rootMargin: "200px 0px 200px 0px" }
  );
  return _io;
}

function useInViewOnce<T extends Element>(ref: RefObject<T | null>) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const io = ensureObserver();
    const cb: IOCallback = (v) => setInView(v);

    _watch.set(el, cb);
    io.observe(el);

    return () => {
      _watch.delete(el);
      try {
        io.unobserve(el);
      } catch {}
    };
  }, [ref, inView]);

  return inView;
}

/* ========= constants ========= */
const HOVER_DUR = 0.4;
const HOVER_EASE_CSS = "cubic-bezier(0.22,1,0.36,1)";
const HOVER_EASE_ARRAY = [0.22, 1, 0.36, 1] as const;
const MAX_TILT_DEG = 5;
const HOVER_ATTACH_DELAY_MS = 120;

/**
 * The phone emblem settles onto its card just after the card lands. The labels
 * match the home list's card variants ("hidden" / "show"), which the emblem
 * inherits; the desktop row has no such parent, so its emblems stay put. The
 * list's stagger does not reach this far down, so the delay comes from the
 * card's place in the list (`custom`).
 */
const EMBLEM_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.86, rotate: -3 },
  show: (order: number) => {
    const delay = CASCADE.delaySec + order * CASCADE.staggerSec + CASCADE.emblemLagSec;
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      // The spring moves it; the fade is plain, or the spring's bounce
      // flickers the emblem's opacity.
      transition: {
        delay,
        type: "spring",
        stiffness: 260,
        damping: 18,
        opacity: { delay, duration: 0.25, ease: "easeOut" },
      },
    };
  },
};
const EMBLEM_PRESS = { type: "spring", stiffness: 520, damping: 28 } as const;

const SAFARI_UA = /^((?!chrome|android).)*safari/i;
const subscribeNever = () => () => {};

/**
 * Safari, decided in the browser after hydration. Read at module load, the
 * server (always "not Safari") and an iPhone disagreed on the card's class
 * names; React keeps the server's attributes in that case, so the Safari
 * styling never applied where it was meant to.
 */
function useIsSafari(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => SAFARI_UA.test(navigator.userAgent),
    () => false
  );
}

/* ========= props ========= */
export interface InlineEntranceCardProps {
  title: string;
  href: string;
  sectionKey: SectionKey;
  description?: string;

  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  logoSrc?: string;
  logoAlt?: string;

  className?: string;
  onActivate?: () => void;

  /**
   * NEW:
   * When true, desktop widths become fluid using clamp()
   * (prevents overflow on in-between widths like 768–1100)
   */
  fluidDesktop?: boolean;

  /**
   * "compact": the collapsed card of the phone/tablet list.
   * "full": the tall card with the hover video, in the desktop row.
   * Chosen by the page, which knows which list it is rendering. The card used
   * to work it out from a media query after hydration, so the server drew the
   * full card on phones and it then collapsed — the cards below jumped
   * (CLS 0.13 on a phone).
   */
  size: "compact" | "full";

  /** The card's place in the phone list; times its emblem's entrance. */
  entranceOrder?: number;
}

export default function InlineEntranceCard({
  title,
  href,
  sectionKey,
  description = "Click Me",
  Logo,
  logoSrc,
  logoAlt,
  className = "",
  onActivate = () => {},
  fluidDesktop = false,
  size,
  entranceOrder = 0,
}: InlineEntranceCardProps) {
  const { startTransition } = useSharedTransition();
  const reduceMotion = usePrefersReducedMotion();
  const isSafari = useIsSafari();

  const isES = href.startsWith("/es");
  const ctaText = isES ? "Haz Click" : "Click Me";

  const isMobile = size === "compact";

  const [isHovered, setIsHovered] = useState(false);
  // While a phone card is held down, its emblem lifts off the card.
  const [isPressed, setIsPressed] = useState(false);
  const emblemMoves = isMobile && !reduceMotion;
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const hoverTO = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hoverTO.current) window.clearTimeout(hoverTO.current);
    };
  }, []);

  const isInView = useInViewOnce(cardRef);

  const lastSeg = href.replace(/\/+$/, "").split("/").pop() || "";
  const slug = lastSeg || sectionKey;

  // derive video name from href segment (existing behavior)
  const videoBase = slug;
  const base = !isMobile && videoBase ? `${videoBase}-HD` : "";

  const prefersWebm = getPrefersWebm();
  const srcA = base ? `/videos/${base}.${prefersWebm ? "webm" : "mp4"}` : "";
  const srcB = base ? `/videos/${base}.${prefersWebm ? "mp4" : "webm"}` : "";

  const sourcesAttachedRef = useRef(false);
  const attachSources = useCallback(() => {
    if (reduceMotion) return;
    if (isMobile || !isInView || sourcesAttachedRef.current) return;
    const v = videoRef.current;
    if (!v || !srcA) return;

    while (v.firstChild) v.removeChild(v.firstChild);

    const s1 = document.createElement("source");
    s1.src = srcA;
    s1.type = srcA.endsWith(".webm") ? "video/webm" : "video/mp4";

    const s2 = document.createElement("source");
    s2.src = srcB;
    s2.type = srcB.endsWith(".webm") ? "video/webm" : "video/mp4";

    v.append(s1, s2);
    v.load();
    sourcesAttachedRef.current = true;
  }, [isMobile, isInView, srcA, srcB, reduceMotion]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile || reduceMotion) return;

    hoverTO.current = window.setTimeout(() => {
      attachSources();
      const v = videoRef.current;

      if (v && isInView) {
        if (v.readyState < 2) v.load();
        v.currentTime = 0;
        v.play().catch(() => {});
      }

      setIsHovered(true);
    }, HOVER_ATTACH_DELAY_MS);
  }, [isMobile, isInView, attachSources, reduceMotion]);

  const handlePointerEnter = handleMouseEnter;

  // Idle prefetch (deduped).
  // NOTE: Chrome doesn't actually support <link rel="preload" as="video"> —
  // it ignores the hint and logs "unsupported 'as' value" to the console.
  // <link rel="prefetch"> warms the HTTP cache for the video just as well
  // for our "play on hover" use case, without the warning.
  useEffect(() => {
    if (reduceMotion) return;
    if (isMobile || !isInView || !srcA) return;

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let cancelIdle: () => void = () => {};
    // Not while the home intro plays: the hero and the alebrije come first.
    const schedule = () => {
      cancelIdle = requestIdle(() => {
        const key = `olivea-preload:${srcA}`;
        if (document.head.querySelector(`link[data-key="${key}"]`)) return;

        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = srcA;
        link.type = srcA.endsWith(".webm") ? "video/webm" : "video/mp4";
        link.setAttribute("data-key", key);
        document.head.appendChild(link);
      }, 1200);
    };
    if (isIntroPlaying()) window.addEventListener(INTRO_DONE_EVENT, schedule, { once: true });
    else schedule();

    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, schedule);
      cancelIdle();
    };
  }, [isMobile, isInView, srcA, reduceMotion]);

  // hover play/pause behavior
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isInView || isMobile || reduceMotion) return;

    if (isHovered) {
      if (!sourcesAttachedRef.current) attachSources();
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isHovered, isMobile, isInView, attachSources, reduceMotion]);

  // Safari/autoplay reliability: retry play on first gesture while hovered
  useEffect(() => {
    if (isMobile || reduceMotion) return;
    if (!isHovered) return;

    const v = videoRef.current;
    if (!v) return;

    let armed = true;
    const tryPlay = () => {
      if (!armed) return;
      v.play()
        .then(() => {
          armed = false;
        })
        .catch(() => {});
    };

    window.addEventListener("pointerdown", tryPlay, { passive: true, once: true });
    return () => window.removeEventListener("pointerdown", tryPlay);
  }, [isHovered, isMobile, reduceMotion]);

  // transform-only tilt
  const applyTilt = (clientX: number, clientY: number) => {
    const node = cardRef.current;
    const rect = rectRef.current;
    if (!node || !rect) return;

    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    const rx = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, -y * MAX_TILT_DEG));
    const ry = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, x * MAX_TILT_DEG));

    node.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rx.toFixed(
      2
    )}deg) rotateY(${ry.toFixed(2)}deg)`;
    node.style.transition = "transform 0.1s ease-out";
  };

  const scheduleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || reduceMotion) return;
    const { clientX, clientY, currentTarget } = e;

    if (!rectRef.current) rectRef.current = currentTarget.getBoundingClientRect();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyTilt(clientX, clientY));
  };

  const clearTilt = () => {
    const node = cardRef.current;
    rectRef.current = null;
    if (!node) return;
    node.style.transform = "perspective(1000px) translateY(0) rotateX(0) rotateY(0)";
    node.style.transition = "transform 0.5s ease";
  };

  // ensure rect cache doesn't go stale
  useEffect(() => {
    const clear = () => (rectRef.current = null);
    window.addEventListener("resize", clear, { passive: true });
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      window.removeEventListener("resize", clear);
      window.removeEventListener("scroll", clear);
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;

    if (hoverTO.current) {
      clearTimeout(hoverTO.current);
      hoverTO.current = null;
    }

    clearTilt();

    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }

    setIsHovered(false);
  }, [isMobile]);

  const handleActivate = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onActivate?.();
      startTransition(sectionKey, href);
    },
    [href, sectionKey, onActivate, startTransition]
  );

  // dimensions (kept — but desktop wrapper can be fluid now)
  const BASE = {
    CARD_W: 256,
    CARD_H: 210,
    TOP_H: 128,
    CIRCLE: 80,
    UNDERLAY_H: 25,
  };

  // 🔥 Responsive desktop scaling — live resize via state
  const [desktopScale, setDesktopScale] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined" || isMobile) return;

    const computeScale = () => {
      const w = window.innerWidth;
      if (w >= 1600) return 1.45;
      if (w >= 1400) return 1.3;
      if (w >= 1200) return 1.15;
      return 1;
    };

    setDesktopScale(computeScale());

    const onResize = () => setDesktopScale(computeScale());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile]);

  const scale = isMobile ? 1 : desktopScale;

  const CARD_WIDTH = BASE.CARD_W * scale;
  const CARD_HEIGHT = BASE.CARD_H * scale;
  const TOP_DESKTOP = BASE.TOP_H * scale;
  const CIRCLE_SIZE = BASE.CIRCLE * scale;
  const UNDERLAY_H = BASE.UNDERLAY_H * scale;

  const topHeight = isMobile ? 0 : TOP_DESKTOP;
  const bottomHeight = CARD_HEIGHT - TOP_DESKTOP;

  const hasLogo = !!Logo || !!logoSrc;

  // The phone card's sizes live in CSS so short screens (`short:` under 700 px
  // tall, `tiny:` under 600) get a smaller card, emblem and title gap
  // straight from the server HTML: three cards and the reserve bar must fit.
  const compactSizes =
    "[--card-h:110px] [--circle:80px] [--title-top:28px] short:[--card-h:96px] short:[--circle:68px] short:[--title-top:21px] tiny:[--card-h:88px] tiny:[--circle:60px] tiny:[--title-top:17px]";

  return (
    <div
      className={`relative ${isMobile ? compactSizes : ""} ${className}`}
      style={{
        // ✅ KEY FIX: fluid desktop widths prevent overflow on mid screens
        width: isMobile
          ? "100%"
          : fluidDesktop
          ? "clamp(240px, 22vw, 360px)"
          : Math.round(CARD_WIDTH),
        overflow: "visible",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={href}
        role="link"
        tabIndex={0}
        aria-label={`${isES ? "Ir a" : "Go to"} ${title}`}
        aria-describedby={slug ? `${slug}-desc` : undefined}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleActivate(e);
        }}
        className="block relative cursor-pointer"
      >
        <motion.div
          whileTap={{ scale: 0.97 }}
          onTapStart={emblemMoves ? () => setIsPressed(true) : undefined}
          onTap={emblemMoves ? () => setIsPressed(false) : undefined}
          onTapCancel={emblemMoves ? () => setIsPressed(false) : undefined}
          className={`relative overflow-visible cursor-pointer ${isMobile ? "drop-shadow-lg" : ""}`}
          onPointerEnter={handlePointerEnter}
        >
          <div
            ref={cardRef}
            onMouseMove={scheduleTilt}
            className="shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
            style={{
              width: "100%",
              height: isMobile ? "var(--card-h)" : Math.round(CARD_HEIGHT),
              cursor: "pointer",
              contain: "layout paint style",
              willChange: "transform",
              transform: "translateZ(0)",
              borderRadius: 24,
            }}
          >
            <div
              style={{
                border: "4px solid #e7eae1",
                borderRadius: 24,
                overflow: "hidden",
                height: "100%",
                background: "transparent",
                boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              }}
            >
              {/* Top (transparent over video) */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 2,
                  height: isHovered ? topHeight * 0.7 : topHeight,
                  transition: `height ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                }}
              >
                {!isMobile && !reduceMotion && (
                  <video
                    ref={videoRef}
                    muted
                    loop
                    playsInline
                    preload="none"
                    tabIndex={-1}
                    controls={false}
                    disablePictureInPicture
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isHovered ? 1 : 0,
                      display: "block",
                      zIndex: 3,
                      willChange: "transform, opacity",
                      transition: `opacity ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                    }}
                  />
                )}
              </div>

              {/* Bottom (cream panel) */}
              <motion.div
                initial={{ height: isMobile ? "100%" : bottomHeight }}
                animate={{
                  height: isMobile ? "100%" : isHovered ? bottomHeight + UNDERLAY_H + 15 : bottomHeight,
                }}
                transition={{ duration: HOVER_DUR, ease: HOVER_EASE_ARRAY }}
                style={{
                  background: "#e7eae1",
                  padding: isMobile ? "10px 16px" : "12px 18px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                }}
              >
                <h2
                  style={{
                    margin: 1,
                    fontFamily: "var(--font-serif)",
                    // Scales down on very narrow phones (320 px) so the title stays
                    // on one line instead of wrapping into the card's hidden overflow.
                    fontSize: isMobile ? "clamp(20px, 6.5vw, 25px)" : Math.round(22 * scale),
                    fontWeight: 600,
                    lineHeight: 1.15,
                    letterSpacing: isMobile ? "0.01em" : undefined,
                    marginTop: isMobile ? "var(--title-top)" : 28,
                    transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                    transition: `transform ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                  }}
                  className="not-italic"
                >
                  {title}
                </h2>

                {/* What the place is. On a phone it sits quietly under the
                    name, so a guest knows what they are opening before they
                    tap; on desktop it appears on hover, as it always has. It
                    stays in the page either way for aria-describedby. */}
                <p
                  id={`${slug}-desc`}
                  style={
                    isMobile
                      ? {
                          margin: 0,
                          marginTop: 2,
                          textAlign: "center",
                          fontFamily: "var(--font-serif)",
                          fontStyle: "italic",
                          fontSize: 14.5,
                          letterSpacing: "0.02em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          opacity: 0.68,
                        }
                      : {
                          marginTop: 6,
                          textAlign: "center",
                          // One line even on the narrowest desktop card (240 px).
                          fontSize: 15,
                          whiteSpace: "nowrap",
                          maxWidth: 320,
                          opacity: isHovered ? 1 : 0,
                          transition: `opacity ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                        }
                  }
                >
                  {description}
                </p>
              </motion.div>
            </div>

          </div>

          {/* Underlay (Safari-friendly) */}
          {!isMobile && (
            <motion.div
              initial={{ y: 0 }}
              animate={isHovered ? { y: UNDERLAY_H } : { y: 0 }}
              transition={{ duration: 0.3, ease: HOVER_EASE_ARRAY }}
              className={`absolute bottom-0 left-0 w-full h-16 flex items-center justify-center pt-7 pointer-events-none ${
                isSafari ? "bg-white/40" : "bg-white/30 backdrop-blur-sm"
              }`}
              style={{
                height: 64,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                zIndex: -1,
              }}
            >
              <span style={{ fontFamily: "var(--font-serif)", color: "#000000" }} className="font-semibold">
                {ctaText}
              </span>
            </motion.div>
          )}

          {/* Logo circle */}
          {hasLogo && (
            <div
              style={{
                position: "absolute",
                zIndex: 4,
                left: "50%",
                width: isMobile ? "var(--circle)" : Math.round(isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE),
                height: isMobile ? "var(--circle)" : Math.round(isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE),
                top: isHovered ? topHeight * 0.6 : topHeight,
                transform: "translate(-50%, -50%)",
                transition: `top ${HOVER_DUR}s ${HOVER_EASE_CSS}, width ${HOVER_DUR}s ${HOVER_EASE_CSS}, height ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
              }}
            >
              <motion.div
                variants={emblemMoves ? EMBLEM_ENTRANCE : undefined}
                custom={entranceOrder}
                style={{ width: "100%", height: "100%" }}
              >
                <motion.div
                  animate={emblemMoves ? { y: isPressed ? -5 : 0, scale: isPressed ? 1.06 : 1 } : undefined}
                  transition={EMBLEM_PRESS}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "4px solid #e7eae1",
                    background: "#e7eae1",
                    overflow: "hidden",
                  }}
                >
                  {Logo ? (
                    <Logo width="100%" height="100%" />
                  ) : (
                    <Image
                      src={logoSrc as string}
                      alt={logoAlt ?? title}
                      fill
                      sizes="96px"
                      className="object-contain"
                      priority
                    />
                  )}
                </motion.div>
              </motion.div>
            </div>
          )}

        </motion.div>
      </a>
    </div>
  );
}