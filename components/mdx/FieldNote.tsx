"use client";

import { cn } from "@/lib/utils";

export default function FieldNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "w-[min(760px,92vw)] mx-auto my-8 rounded-2xl bg-[#e7eae1]/80 ring-1 ring-black/10 p-4 md:p-5 text-sm text-oliveaText/70",
        className
      )}
    >
      {children}
    </aside>
  );
}