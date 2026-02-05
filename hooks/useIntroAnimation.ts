// hooks/useIntroAnimation.ts
"use client";
import { useState, useRef, useEffect } from "react";
import { useAnimation } from "framer-motion";
import { TIMING, SPLASH } from "@/lib/introConstants";

export function useIntroAnimation(isMobile: boolean) {
  // motion controllers
  const overlayControls = useAnimation();
  const innerScaleControls = useAnimation();
  const logoControls = useAnimation();
  const logoBobControls = useAnimation();

  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroBoxRef = useRef<HTMLDivElement>(null);
  const logoTargetRef = useRef<HTMLDivElement>(null);

  // state
  const [allowLoader, setAllowLoader] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [revealMain, setRevealMain] = useState(false);
  const [introStarted, setIntroStarted] = useState(true);
  const [overlayGone, setOverlayGone] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hideBase, setHideBase] = useState(false);
  const [internalReturn, setInternalReturn] = useState(false);

  // idle gate for loader
  useEffect(() => {
    let idle: number | null = null;
    let to: ReturnType<typeof setTimeout> | null = null;
    if ("requestIdleCallback" in window) {
      idle = (window as any).requestIdleCallback(
        () => setAllowLoader(true),
        { timeout: 800 }
      );
    } else {
      to = setTimeout(() => setAllowLoader(true), 300);
    }
    return () => {
      if (idle !== null && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idle);
      }
      if (to) clearTimeout(to);
    };
  }, []);

  // internal-return detection
  useEffect(() => {
    const viaLogo = sessionStorage.getItem("olivea:returning") === "1";
    if (viaLogo) {
      setInternalReturn(true);
      sessionStorage.removeItem("olivea:returning");
    } else {
      const prev = sessionStorage.getItem("prevPath");
      const internal =
        !!prev &&
        (prev.startsWith("/es") ||
          prev.startsWith("/en") ||
          prev.startsWith("/casa") ||
          prev.startsWith("/farmtotable") ||
          prev.startsWith("/cafe"));
      setInternalReturn(internal);
    }
    document.body.classList.remove("lcp-demote");
  }, []);

  // bobbing (respect reduced motion)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) {
        logoBobControls.start({ y: 0, transition: { duration: 0 } });
      } else {
        logoBobControls.start({
          y: [0, -6, 0],
          transition: { duration: SPLASH.bobSec, repeat: Infinity, ease: "easeInOut" },
        });
      }
    };
    apply();
    mq.addEventListener?.("change", apply);
    mq.addListener?.(apply);
    return () => {
      mq.removeEventListener?.("change", apply);
      mq.removeListener?.(apply);
    };
  }, [logoBobControls]);

  // reveal main -> let hero paint as LCP
  useEffect(() => {
    setRevealMain(true);
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event("olivea:bg-ready"));
    });
  }, []);

  // handoff to video after reveal
  useEffect(() => {
    if (!revealMain) return;
    queueMicrotask(() => setShowVideo(true));
  }, [revealMain]);

  // LCP gating and timers -> setHideBase(true)
  useEffect(() => {
    let lcpSeen = false,
      bgReady = false,
      minHold = false,
      done = false;

    const routeT0 = performance.now();

    const maybeDemote = () => {
      if (done) return;
      if (internalReturn && !introStarted) return;
      if (lcpSeen && bgReady && minHold) {
        done = true;
        const el = document.querySelector<HTMLElement>(".fixed-lcp");
        if (el) {
          el.style.willChange = "opacity";
          el.addEventListener("transitionend", () => (el.style.willChange = ""), {
            once: true,
          });
        }
        setHideBase(true);
        document.body.classList.add("lcp-demote");
        po?.disconnect();
        clearTimeout(minTimer);
        clearTimeout(safetyCap);
        clearTimeout(lcpBackupTimer);
        document.removeEventListener("olivea:bg-ready", onBgReady);
      }
    };

    const minTimer = setTimeout(() => {
      minHold = true;
      maybeDemote();
    }, 300);

    const safetyCap = setTimeout(() => {
      bgReady = true;
      maybeDemote();
    }, 1500);

    const onBgReady = () => {
      bgReady = true;
      maybeDemote();
    };
    document.addEventListener("olivea:bg-ready", onBgReady, { once: true });

    let po: PerformanceObserver | null = null;
    const supportsLCP =
      "PerformanceObserver" in window &&
      (PerformanceObserver as any).supportedEntryTypes?.includes(
        "largest-contentful-paint"
      );

    const lcpBackupTimer = setTimeout(() => {
      if (!lcpSeen) {
        lcpSeen = true;
        maybeDemote();
      }
    }, 1200);

    try {
      if (supportsLCP) {
        po = new PerformanceObserver((list) => {
          const fresh = list.getEntries().some((e) => e.startTime >= routeT0 - 50);
          if (fresh) {
            lcpSeen = true;
            maybeDemote();
          }
        });
        po.observe({ type: "largest-contentful-paint", buffered: true });
      } else {
        lcpSeen = true;
        maybeDemote();
      }
    } catch {
      lcpSeen = true;
      maybeDemote();
    }

    return () => {
      po?.disconnect();
      clearTimeout(minTimer);
      clearTimeout(safetyCap);
      clearTimeout(lcpBackupTimer);
      document.removeEventListener("olivea:bg-ready", onBgReady);
    };
  }, [internalReturn, introStarted]);

  // intro prep: wait a moment + metadata (or 500ms), signal bg-ready
  useEffect(() => {
    let cancelled = false;
    document.body.classList.add("overflow-hidden");

    const runIntro = async () => {
      try {
        await new Promise((r) =>
          setTimeout(r, Math.max(TIMING.introHoldMs, SPLASH.holdMs))
        );
        if (cancelled) return;

        if (!heroBoxRef.current || !logoTargetRef.current) return;

        await Promise.race([
          new Promise<void>((res) => {
            const v = videoRef.current;
            if (v && v.readyState >= HTMLMediaElement.HAVE_METADATA) return res();
            v?.addEventListener("loadedmetadata", () => res(), { once: true });
          }),
          new Promise<void>((res) => setTimeout(res, 500)),
        ]);
        if (cancelled) return;

        requestAnimationFrame(() => {
          document.dispatchEvent(new Event("olivea:bg-ready"));
        });
      } finally {
        if (!cancelled) document.body.classList.remove("overflow-hidden");
      }
    };

    runIntro();
    return () => {
      cancelled = true;
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // desktop autoplay reliability
  useEffect(() => {
    if (isMobile) return;
    const v = videoRef.current;
    if (!showVideo || !v) return;

    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;

    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= HTMLMediaElement.HAVE_METADATA) tryPlay();

    const onMeta = () => tryPlay();
    const onCanPlay = () => tryPlay();
    const onTouch = () => tryPlay();
    const onVisible = () => {
      if (!document.hidden) tryPlay();
    };
    const onLoadedData = () => {
      document.dispatchEvent(new Event("olivea:bg-ready"));
    };

    v.addEventListener("loadedmetadata", onMeta, { once: true });
    v.addEventListener("canplay", onCanPlay, { once: true });
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    document.addEventListener("visibilitychange", onVisible);
    v.addEventListener("loadeddata", onLoadedData, { once: true });

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("canplay", onCanPlay);
      window.removeEventListener("touchstart", onTouch);
      document.removeEventListener("visibilitychange", onVisible);
      v.removeEventListener("loadeddata", onLoadedData);
    };
  }, [isMobile, showVideo]);

  // fallback signal
  useEffect(() => {
    if (!revealMain) return;
    const id = requestAnimationFrame(() => {
      document.dispatchEvent(new Event("olivea:bg-ready"));
    });
    return () => cancelAnimationFrame(id);
  }, [revealMain]);

  return {
    videoRef,
    heroBoxRef,
    logoTargetRef,
    overlayControls,
    innerScaleControls,
    logoControls,
    logoBobControls,
    allowLoader,
    showLoader,
    revealMain,
    introStarted,
    overlayGone,
    showVideo,
    hideBase,
    setOverlayGone,
    setShowLoader,
    setIntroStarted,
  };
}
