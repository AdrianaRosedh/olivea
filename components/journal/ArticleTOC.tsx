// components/journal/ArticleTOC.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export type TocItem = {
  id: string;
  title: string;
  level: number; // 2,3,4...
};

export default function ArticleTOC({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>("");

  const normalized = useMemo(() => {
    return items
      .filter((x) => x?.id && x?.title)
      .map((x) => ({ ...x, level: Math.min(4, Math.max(2, x.level || 2)) }));
  }, [items]);

  useEffect(() => {
    const headings = normalized
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // pick the top-most visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [normalized]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="mb-3 text-sm font-medium opacity-80">On this page</div>
      <nav className="space-y-2">
        {normalized.map((i) => {
          const isActive = active === i.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => jump(i.id)}
              className={[
                "block w-full text-left text-sm",
                "rounded-lg px-2 py-1",
                "hover:opacity-90",
                isActive ? "bg-black/5 font-medium dark:bg-white/10" : "opacity-75",
                i.level === 3 ? "pl-5" : "",
                i.level === 4 ? "pl-8" : "",
              ].join(" ")}
            >
              {i.title}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
