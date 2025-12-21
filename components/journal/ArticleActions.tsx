// components/journal/ArticleActions.tsx
"use client";

import { useMemo, useState } from "react";

type Lang = "es" | "en";

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};

export default function ArticleActions({
  lang,
  canonicalPath,
}: {
  lang: Lang;
  canonicalPath: string;
}) {
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (typeof window === "undefined") return canonicalPath;
    return new URL(canonicalPath, window.location.origin).toString();
  }, [canonicalPath]);

  const labels = {
    share: lang === "es" ? "Compartir" : "Share",
    copy: lang === "es" ? "Copiar link" : "Copy link",
    copied: lang === "es" ? "Copiado" : "Copied",
    bigger: "A+",
    smaller: "A-",
  };

  function bumpFont(delta: number) {
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue("--journal-font-scale").trim();
    const current = raw ? Number(raw) : 1;
    const safeCurrent = Number.isFinite(current) ? current : 1;

    const next = Math.min(1.2, Math.max(0.9, safeCurrent + delta));
    root.style.setProperty("--journal-font-scale", String(next));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  async function share() {
    try {
      const nav = navigator as ShareCapableNavigator;
      if (nav.share) {
        await nav.share({ url });
        return;
      }
    } catch {
      // ignore
    }
    await copy();
  }

  return (
    <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={share}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:opacity-90 dark:border-white/10"
        >
          {labels.share}
        </button>

        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:opacity-90 dark:border-white/10"
        >
          {copied ? labels.copied : labels.copy}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => bumpFont(0.05)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:opacity-90 dark:border-white/10"
            aria-label="Increase font size"
          >
            {labels.bigger}
          </button>
          <button
            type="button"
            onClick={() => bumpFont(-0.05)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:opacity-90 dark:border-white/10"
            aria-label="Decrease font size"
          >
            {labels.smaller}
          </button>
        </div>
      </div>
    </div>
  );
}