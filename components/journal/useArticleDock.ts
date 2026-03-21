import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import { tt } from "@/lib/i18n";
import type { TocItem } from "@/components/journal/ArticleTOC";
import { shortPathForArticle } from "@/lib/journal/shortcode";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};

function enc(s: string) {
  return encodeURIComponent(s);
}

export function openPopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export interface ArticleDockState {
  // Labels
  labels: {
    share: string;
    copy: string;
    copied: string;
    bigger: string;
    smaller: string;
    toc: string;
    close: string;
    done: string;
    clipboardBlocked: string;
    shareTo: string;
    threads: string;
    facebook: string;
    x: string;
    linkedin: string;
  };

  // URLs
  url: string;
  shortUrl: string;
  shareText: string;
  shareLinks: {
    threads: string;
    facebook: string;
    x: string;
    linkedin: string;
  };

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;

  // Font scaling
  bumpFont: (delta: number) => void;

  // Copy
  copy: () => Promise<void>;

  // Share state
  shareOpen: boolean;
  setShareOpen: Dispatch<SetStateAction<boolean>>;
  sharePanelOpen: boolean;
  setSharePanelOpen: Dispatch<SetStateAction<boolean>>;
  tryNativeShare: () => Promise<boolean>;

  // TOC state
  tocSheetOpen: boolean;
  setTocSheetOpen: Dispatch<SetStateAction<boolean>>;
  tocPanelOpen: boolean;
  setTocPanelOpen: Dispatch<SetStateAction<boolean>>;

  // Mobile bar hide/show
  barHidden: boolean;

  // HAsTOC
  hasToc: boolean;
}

export function useArticleDock({
  lang,
  canonicalPath,
  toc,
}: {
  lang: Lang;
  canonicalPath: string;
  toc: TocItem[];
}): ArticleDockState {
  const hasToc = toc.length > 0;

  const labels = useMemo(
    () => ({
      share: tt(lang, "Compartir", "Share"),
      copy: tt(lang, "Copiar link", "Copy link"),
      copied: tt(lang, "Copiado", "Copied"),
      bigger: tt(lang, "Aumentar texto", "Increase text"),
      smaller: tt(lang, "Reducir texto", "Decrease text"),
      toc: tt(lang, "Secciones", "Sections"),
      close: tt(lang, "Cerrar", "Close"),
      done: tt(lang, "Listo", "Done"),
      clipboardBlocked: tt(
        lang,
        "Copia manual: selecciona y copia el link.",
        "Manual copy: select and copy the link."
      ),
      shareTo: tt(lang, "Compartir en", "Share to"),
      threads: "Threads",
      facebook: "Facebook",
      x: "X",
      linkedin: "LinkedIn",
    }),
    [lang]
  );

  const url = useMemo(() => {
    if (typeof window === "undefined") return canonicalPath;
    return new URL(canonicalPath, window.location.origin).toString();
  }, [canonicalPath]);

  const shortUrl = useMemo(() => {
    if (typeof window === "undefined") return url;

    // canonicalPath: "/es/journal/<slug>"
    const parts = canonicalPath.split("/").filter(Boolean);
    const l = parts[0] || "es";
    const slug = parts[2] || "";
    if (!slug) return url;

    const shortPath = shortPathForArticle(l, slug);
    return new URL(shortPath, window.location.origin).toString();
  }, [canonicalPath, url]);

  const shareText = useMemo(() => {
    return tt(lang, "Olivea — Journal", "Olivea — Journal");
  }, [lang]);

  const shareLinks = useMemo(() => {
    const threads = `https://www.threads.net/intent/post?text=${enc(
      shareText
    )}&url=${enc(url)}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    const x = `https://twitter.com/intent/tweet?text=${enc(
      shareText
    )}&url=${enc(url)}`;
    const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(
      url
    )}`;
    return { threads, facebook, x, linkedin };
  }, [shareText, url]);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  /**
   * Font scale that *always* works:
   * set var on <html>, <body>, and <main> if present.
   */
  const setScaleVar = useCallback((value: number) => {
    const v = String(value);
    document.documentElement.style.setProperty("--journal-font-scale", v);
    document.body.style.setProperty("--journal-font-scale", v);

    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
      main.style.setProperty("--journal-font-scale", v);
    }
  }, []);

  // Ensure default exists
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--journal-font-scale")
      .trim();
    if (!raw) setScaleVar(1);
  }, [setScaleVar]);

  const bumpFont = useCallback(
    (delta: number) => {
      const root = document.documentElement;
      const raw = getComputedStyle(root)
        .getPropertyValue("--journal-font-scale")
        .trim();
      const current = raw ? Number(raw) : 1;
      const safe = Number.isFinite(current) ? current : 1;

      const next = Math.min(1.25, Math.max(0.9, safe + delta));
      setScaleVar(next);
      showToast(`${next.toFixed(2)}×`);
    },
    [setScaleVar, showToast]
  );

  const copy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard");
      await navigator.clipboard.writeText(shortUrl);
      showToast(labels.copied);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = shortUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast(labels.copied);
      } catch {
        showToast(labels.clipboardBlocked);
      }
    }
  }, [labels.clipboardBlocked, labels.copied, shortUrl, showToast]);

  const tryNativeShare = useCallback(async () => {
    try {
      const nav = navigator as ShareCapableNavigator;
      if (nav.share) {
        await nav.share({ url, text: shareText });
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [shareText, url]);

  const [shareOpen, setShareOpen] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);

  const [tocSheetOpen, setTocSheetOpen] = useState(false);
  const [tocPanelOpen, setTocPanelOpen] = useState(false);

  // ✅ One ref-counted body lock for ANY mobile sheet open
  useEffect(() => {
    const anySheetOpen = shareOpen || tocSheetOpen;
    if (!anySheetOpen) return;

    setModalOpen(true);
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [shareOpen, tocSheetOpen]);

  /* =========================
     mobile bar hide/show
     ========================= */
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    lastY.current = y;

    if (shareOpen || tocSheetOpen) return;

    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;
    const HIDE_DELTA = 14;
    const SHOW_DELTA = -2;

    if (delta > HIDE_DELTA) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < SHOW_DELTA) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
    }
  });

  return {
    labels,
    url,
    shortUrl,
    shareText,
    shareLinks,
    toast,
    showToast,
    bumpFont,
    copy,
    shareOpen,
    setShareOpen,
    sharePanelOpen,
    setSharePanelOpen,
    tryNativeShare,
    tocSheetOpen,
    setTocSheetOpen,
    tocPanelOpen,
    setTocPanelOpen,
    barHidden,
    hasToc,
  };
}
