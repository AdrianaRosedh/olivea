// app/(main)/[lang]/journal/JournalFilterDock.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Lang } from "../dictionaries";

type Post = {
  pillar: string;
  tags?: string[];
  publishedAt: string;
  readingMinutes: number;

  // ✅ matches your schema
  author?: string | { id?: string; name: string };
};

export type JournalFilterDockProps = {
  lang: Lang;
  posts: Post[];

  q: string;
  setQ: (v: string) => void;

  pillar: string;
  setPillar: (v: string) => void;

  tag: string;
  setTag: (v: string) => void;

  year: string;
  setYear: (v: string) => void;

  time: string;
  setTime: (v: string) => void;

  sort: "newest" | "oldest";
  setSort: (v: "newest" | "oldest") => void;

  onClear: () => void;
  count: number;
};

const MobileDock = dynamic(() => import("./JournalFilterDock.mobile"), {
  ssr: false,
  loading: () => null,
});

const DesktopDock = dynamic(() => import("./JournalFilterDock.desktop"), {
  ssr: false,
  loading: () => null,
});

export default function JournalFilterDock(props: JournalFilterDockProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // Tailwind lg
    const sync = () => setIsDesktop(mq.matches);
    sync();

    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);

  if (isDesktop === null) return null;

  return isDesktop ? <DesktopDock {...props} /> : <MobileDock {...props} />;
}