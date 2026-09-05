"use client";

// app/[lang]/(main)/vota/VoteClient.tsx
//
// Composed like the homepage: one fixed, full-viewport screen that never
// scrolls, on mobile and on desktop. The homepage's hero video plays behind
// everything; mobile frames it as a pill at the top, desktop lets it fill the
// screen with the cards laid across it.
//
// The card IS the button. On the homepage a card is the link — there is no
// separate control inside it — and copying that is also what makes the page
// fit without scrolling.
//
// Two mechanics carry the campaign:
//  1. Per-device memory of which category has been cast. The ballot allows one
//     vote in Restaurantes AND one in Hoteles, but nobody discovers the second
//     on their own, so the bottom action becomes the remaining one on return.
//  2. One-tap sharing via the Web Share API. Repeat voting is capped by device
//     fingerprint, so the only honest way the number grows is another person.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VoteCopy } from "./copy";
import ShareSheet from "./ShareSheet";

type Key = VoteCopy["cards"][number]["key"];
type Card = VoteCopy["cards"][number];

const STORAGE_KEY = "olivea:mexbest2026:cast";

/**
 * The homepage's hero, on the homepage's terms: paint `hero.avif` first so
 * there is a sharp frame immediately, then fade the video in over it once the
 * poster has had a moment. Mobile gets the 899KB mobile encode rather than the
 * 1.7MB desktop one, and reduced-motion keeps the still.
 */
function HeroMedia({ alt }: { alt: string }) {
  const [videoBase, setVideoBase] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wide = window.matchMedia("(min-width: 1024px)");
    // Re-evaluated on change, not just at mount: a phone rotating into
    // landscape, or a desktop window being widened, otherwise keeps whichever
    // encode happened to match on the first frame.
    const pick = () => setVideoBase(wide.matches ? "homepage-HD" : "homepage-mobile");

    // Let the poster paint before asking the network for the clip.
    const t = window.setTimeout(pick, 400);
    wide.addEventListener("change", pick);
    return () => {
      window.clearTimeout(t);
      wide.removeEventListener("change", pick);
    };
  }, []);

  return (
    <>
      <Image
        src="/images/hero.avif"
        alt={alt}
        fill
        priority
        fetchPriority="high"
        quality={60}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "50% 45%" }}
      />
      {videoBase && (
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          controls={false}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ objectPosition: "50% 45%", opacity: playing ? 1 : 0 }}
        >
          <source src={`/videos/${videoBase}.webm`} type="video/webm" />
          <source src={`/videos/${videoBase}.mp4`} type="video/mp4" />
        </video>
      )}
    </>
  );
}

/**
 * The property's own clip, desktop hover only, `preload="none"`, with no
 * <source> until the pointer arrives — so it costs the phone visitor nothing.
 */
function CardVideo({ base, active }: { base: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const wired = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !active) return;

    if (!wired.current) {
      wired.current = true;
      // Same codec probe as InlineEntranceCard: webm first where supported,
      // since those files are 3-4x smaller than the mp4 fallbacks.
      const prefersWebm = !!document
        .createElement("video")
        .canPlayType?.('video/webm; codecs="vp9,vorbis"');
      for (const ext of prefersWebm ? ["webm", "mp4"] : ["mp4", "webm"]) {
        const s = document.createElement("source");
        s.src = `/videos/${base}-HD.${ext}`;
        s.type = ext === "webm" ? "video/webm" : "video/mp4";
        v.appendChild(s);
      }
      v.load();
    }
    void v.play().catch(() => {
      // Autoplay refused. The hero behind is a complete card on its own.
    });
  }, [active, base]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      controls={false}
      disablePictureInPicture
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:hidden"
      style={{ opacity: active ? 1 : 0 }}
    />
  );
}

function readCast(): Key[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k): k is Key => k === "restaurant" || k === "hotel");
  } catch {
    return [];
  }
}

/** The homepage's RESERVE bar: solid olive, wide letter-spaced caps. */
const BAR_BUTTON =
  "flex h-13 w-full items-center justify-center whitespace-nowrap rounded-md bg-(--olivea-olive) " +
  "px-6 text-center text-[15px] uppercase tracking-[0.2em] text-(--olivea-cream) " +
  "transition-transform active:scale-[0.98] " +
  "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40 focus-visible:ring-offset-2";

export default function VoteClient({ copy }: { copy: VoteCopy }) {
  // Starts empty so server and first client render agree; the real value
  // arrives in the effect below.
  const [cast, setCast] = useState<Key[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [hovered, setHovered] = useState<Key | null>(null);

  useEffect(() => {
    setCast(readCast());
    setHydrated(true);
  }, []);

  const mark = useCallback((key: Key) => {
    setCast((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private browsing, or storage disabled. The links still work; the
        // page just won't remember. Nothing here is worth an error state.
      }
      return next;
    });
  }, []);

  const isDone = (k: Key) => hydrated && cast.includes(k);

  /**
   * The bottom bar holds the homepage's RESERVE slot: one constant primary
   * action. Coming back with a single category cast, the remaining vote is
   * worth more than anything else on screen, so it takes the slot. Otherwise
   * it invites the only honest way the count still grows — another person.
   */
  const remaining = copy.cards.find((c) => !cast.includes(c.key));
  const barVote = hydrated && cast.length === 1 ? remaining : undefined;

  /** The card's panel. Opaque in both states: it sits over moving video, and a
   *  translucent panel there made the property names unreadable. */
  const panel = (k: Key) => (isDone(k) ? "bg-(--olivea-sand)" : "bg-(--olivea-cream)");

  const CardBody = ({ card, desktop }: { card: Card; desktop?: boolean }) => {
    const done = isDone(card.key);
    return (
      <>
        {/* Alebrije in a circle straddling the top edge — the homepage's mark. */}
        <div
          className={[
            "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full",
            "border-4 border-(--olivea-cream) bg-(--olivea-cream)",
            desktop ? "h-[76px] w-[76px]" : "h-[70px] w-[70px]",
          ].join(" ")}
        >
          <Image
            src={card.logoSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="76px"
            loading="eager"
            className="object-contain p-1"
          />
        </div>

        <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-(--olivea-olive)/75">
          {card.category}
        </span>
        <h2 className="mt-1 font-(family-name:--font-serif) text-[1.55rem] leading-tight font-semibold text-(--olivea-olive) lg:text-[1.75rem]">
          {card.name}
        </h2>
        <span
          className={[
            "mt-1.5 block whitespace-nowrap text-[10.5px] uppercase tracking-[0.2em]",
            done ? "text-(--olivea-olive)" : "text-(--olivea-olive)/60",
          ].join(" ")}
        >
          {done ? `✓ ${card.done}` : card.ctaShort}
        </span>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-10 overflow-hidden bg-(--olivea-cream)">
      {/* ══ ONE media layer ═══════════════════════════════════════════════
          A pill at the top on mobile, the whole screen on desktop. Rendering
          it once — rather than inside each layout — is what keeps this to a
          single hero download and a single video. */}
      {/* Deliberately NOT the `.hero-pill` class. That helper carries two
          things this page must not inherit: an unlayered `position: relative`
          (which outranks Tailwind's `absolute` and collapsed this layer to
          zero height), and an explicit width that subtracts the chapter-rail
          docks — rails this full-viewport page does not render, so the layer
          came out 1026px inside a 1424px box. Its desktop radius is also the
          asymmetric section-hero shape, where the homepage's own full-screen
          video is a plain rounded rectangle. So: our own geometry, our own
          radius. Explicit sides rather than `inset-*`, so the lg overrides
          cannot collide with the base values on the same property. */}
      <div
        className="
          absolute left-3 right-3 top-3 h-[30dvh]
          lg:left-2 lg:right-2 lg:top-2 lg:bottom-2 lg:h-auto
        "
      >
        <div className="relative h-full w-full overflow-hidden rounded-[28px] shadow-[0_12px_32px_rgba(0,0,0,0.18)] lg:rounded-3xl">
          <HeroMedia alt={copy.heroAlt} />
          {/* Mobile: gradient so the title reads at the pill's foot. */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent lg:hidden" />
          {/* Desktop: an even scrim behind the whole composition. */}
          <div className="absolute inset-0 hidden bg-black/35 lg:block" />
        </div>
      </div>

      {/* ══ MOBILE ══════════════════════════════════════════════════════ */}
      <div className="relative flex h-full w-full flex-col p-3 lg:hidden">
        {/* Sits exactly over the media pill above. */}
        <div className="flex h-[30dvh] flex-none flex-col items-center justify-end px-5 pb-5 text-center">
          <span className="v-rise v-rise-1 block text-[9px] font-semibold uppercase tracking-[0.26em] text-white/90">
            {copy.eyebrow}
          </span>
          <span className="v-rise v-rise-2 mt-1 block font-(family-name:--font-serif) text-[1.7rem] leading-tight text-white">
            {copy.title}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center gap-9 py-8">
          {copy.cards.map((card, i) => (
            <a
              key={card.key}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mark(card.key)}
              onAuxClick={() => mark(card.key)}
              className={[
                "v-rise relative flex flex-col items-center rounded-3xl border-4 px-5 pt-11 pb-5 text-center",
                "border-(--olivea-cream) shadow-[0_12px_32px_rgba(0,0,0,0.15)]",
                "transition-transform active:scale-[0.97]",
                i === 0 ? "v-rise-1" : "v-rise-2",
                panel(card.key),
              ].join(" ")}
            >
              <CardBody card={card} />
            </a>
          ))}
        </div>

        {/* Fine line + primary action — the homepage's MICHELIN line + RESERVE */}
        <div className="flex-none pb-[max(env(safe-area-inset-bottom),4px)]">
          <span className="mb-2.5 block text-center text-[10px] uppercase tracking-[0.16em] text-(--olivea-olive)/70">
            {copy.fineShort}
          </span>
          {barVote ? (
            <a
              href={barVote.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mark(barVote.key)}
              className={BAR_BUTTON}
            >
              {barVote.cta}
            </a>
          ) : (
            <button type="button" onClick={() => setShareOpen(true)} className={BAR_BUTTON}>
              {copy.shareCta}
            </button>
          )}
          {/* Way off this dead-end page into the actual site. */}
          <Link
            href={copy.homeHref}
            className="mt-3 block text-center text-[11px] uppercase tracking-[0.16em] text-(--olivea-olive)/70 underline-offset-4 hover:underline"
          >
            {copy.homeCta} →
          </Link>
        </div>
      </div>

      {/* ══ DESKTOP ═════════════════════════════════════════════════════ */}
      <div className="relative hidden h-full w-full flex-col items-center justify-center px-8 lg:flex">
        <span className="v-rise v-rise-1 block text-[11px] font-semibold uppercase tracking-[0.3em] text-white/90">
          {copy.eyebrow}
        </span>
        <h1 className="v-rise v-rise-2 mt-3 font-(family-name:--font-serif) text-5xl leading-tight text-white xl:text-6xl">
          {copy.title}
        </h1>
        <span className="v-rise v-rise-3 mt-2 block font-(family-name:--font-serif) text-xl italic text-white/90">
          {copy.heroLine}
        </span>

        {/* Cards across the hero, as the homepage lays out its entrances:
            the video reads through above the badge, cream below it. */}
        <div className="v-rise v-rise-4 mt-12 flex items-stretch justify-center gap-8">
          {copy.cards.map((card) => (
            <a
              key={card.key}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mark(card.key)}
              onAuxClick={() => mark(card.key)}
              onPointerEnter={() => setHovered(card.key)}
              onPointerLeave={() => setHovered((h) => (h === card.key ? null : h))}
              onFocus={() => setHovered(card.key)}
              onBlur={() => setHovered((h) => (h === card.key ? null : h))}
              className="
                relative flex h-[270px] w-[340px] flex-col overflow-hidden rounded-3xl
                border-4 border-(--olivea-cream)
                shadow-[0_12px_32px_rgba(0,0,0,0.28)]
                transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]
                xl:w-[380px]
              "
            >
              {/* The hero reads through here, and the property's own clip
                  fades in over it on hover. */}
              <div className="relative h-[96px] w-full flex-none overflow-hidden">
                <CardVideo base={card.videoBase} active={hovered === card.key} />
              </div>
              {/* The top padding is the badge's overhang: it straddles this
                  edge and would otherwise land on the category label. */}
              <div
                className={[
                  "relative flex w-full flex-1 flex-col items-center justify-center px-5 pt-11 pb-5 text-center",
                  panel(card.key),
                ].join(" ")}
              >
                <CardBody card={card} desktop />
              </div>
            </a>
          ))}
        </div>

        <span className="v-rise v-rise-4 mt-10 block text-[11px] uppercase tracking-[0.18em] text-white/85">
          {copy.fineShort}
        </span>

        {/* Mirrors the mobile bar: the unfinished vote takes the slot while one
            category is still open, and Share only appears once both are cast,
            so the page never nudges you to amplify with half the job undone. */}
        <div className="v-rise v-rise-4 mt-5 min-w-[240px]">
          {barVote ? (
            <a
              href={barVote.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mark(barVote.key)}
              className={BAR_BUTTON}
            >
              {barVote.cta}
            </a>
          ) : (
            <button type="button" onClick={() => setShareOpen(true)} className={BAR_BUTTON}>
              {copy.shareCta}
            </button>
          )}
        </div>

        {/* Way off this dead-end page into the actual site. */}
        <Link
          href={copy.homeHref}
          className="v-rise v-rise-4 mt-5 text-[12px] uppercase tracking-[0.18em] text-white/85 underline-offset-4 hover:underline"
        >
          {copy.homeCta} →
        </Link>
      </div>

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} copy={copy} />
    </div>
  );
}
