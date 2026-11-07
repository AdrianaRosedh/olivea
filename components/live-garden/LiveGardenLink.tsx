"use client";

// An inline invitation to the live garden map, for the chapters where the
// garden is the story (Farm To Table's ecosystem, the café's opening, the
// Philosophy page's sustainability chapter). It opens the same map as the
// roseiies orb, so a reader who has just read about the garden has a reason —
// and an obvious way — to look at it, and the orb gains context. Each placement
// names its source so openings are counted per spot (lib/liveGarden.ts).

import { useUiText } from "@/lib/uiText/context";
import { openLiveGarden, type LiveGardenSource } from "@/lib/liveGarden";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LiveGardenLink({
  lang,
  source,
  className,
}: {
  lang: Lang;
  source: LiveGardenSource;
  className?: string;
}) {
  const t = useUiText(lang);
  return (
    <button
      type="button"
      onClick={() => openLiveGarden(source)}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full py-2 text-left",
        "text-[12px] font-semibold uppercase tracking-[0.22em] text-(--olivea-olive)",
        "outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40 focus-visible:ring-offset-4 focus-visible:ring-offset-(--olivea-cream)",
        className,
      )}
    >
      {/* The same live dot as the orb, so the two read as one thing. */}
      <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
        <span
          className="absolute inset-0 rounded-full bg-(--olivea-olive) motion-safe:animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <span className="relative h-2 w-2 rounded-full bg-(--olivea-olive)" />
      </span>
      <span className="underline decoration-(--olivea-olive)/30 underline-offset-[6px] transition-colors group-hover:decoration-(--olivea-olive)">
        {t("garden.link")}
      </span>
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}
