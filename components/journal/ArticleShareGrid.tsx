"use client";

import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { openPopup } from "./useArticleDock";

interface ArticleShareGridProps {
  labels: {
    threads: string;
    facebook: string;
    x: string;
    linkedin: string;
    copy: string;
  };
  shareLinks: {
    threads: string;
    facebook: string;
    x: string;
    linkedin: string;
  };
  onCopy: () => Promise<void>;
  onDone?: () => void;
}

export function ArticleShareGrid({
  labels,
  shareLinks,
  onCopy,
  onDone,
}: ArticleShareGridProps) {
  const btn = cn(
    "rounded-2xl px-4 py-3 text-left",
    "bg-white/30 ring-1 ring-(--olivea-olive)/14 hover:bg-white/38 transition",
    "text-(--olivea-olive)"
  );

  const iconWrap = cn(
    "h-9 w-9 rounded-full bg-white/35 ring-1 ring-(--olivea-olive)/12",
    "inline-flex items-center justify-center"
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className={btn}
        onClick={() => openPopup(shareLinks.threads)}
      >
        <div className="flex items-center gap-3">
          <span className={iconWrap}>@</span>
          <div className="text-[13px] font-medium">{labels.threads}</div>
        </div>
      </button>

      <button
        type="button"
        className={btn}
        onClick={() => openPopup(shareLinks.facebook)}
      >
        <div className="flex items-center gap-3">
          <span className={iconWrap}>f</span>
          <div className="text-[13px] font-medium">{labels.facebook}</div>
        </div>
      </button>

      <button
        type="button"
        className={btn}
        onClick={() => openPopup(shareLinks.x)}
      >
        <div className="flex items-center gap-3">
          <span className={iconWrap}>𝕏</span>
          <div className="text-[13px] font-medium">{labels.x}</div>
        </div>
      </button>

      <button
        type="button"
        className={btn}
        onClick={() => openPopup(shareLinks.linkedin)}
      >
        <div className="flex items-center gap-3">
          <span className={iconWrap}>in</span>
          <div className="text-[13px] font-medium">{labels.linkedin}</div>
        </div>
      </button>

      <button
        type="button"
        className={cn(btn, "col-span-2")}
        onClick={async () => {
          await onCopy();
          onDone?.();
        }}
      >
        <div className="flex items-center gap-3">
          <span className={iconWrap}>
            <Link2 className="h-4 w-4" />
          </span>
          <div className="text-[13px] font-medium">{labels.copy}</div>
        </div>
      </button>
    </div>
  );
}
