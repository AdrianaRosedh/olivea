"use client";

import type { PropsWithChildren, ReactNode } from "react";

type Props = {
  id?: string;
  title: ReactNode;
  className?: string;
};

export default function StickyBlock({
  id,
  title,
  className = "",
  children,
}: PropsWithChildren<Props>) {
  return (
    <section
      id={id}
      className={`w-[min(1200px,92vw)] mx-auto grid md:grid-cols-12 gap-8 py-12 md:py-20 ${className}`}
    >
      <div className="md:col-span-4">
        <div className="md:sticky md:top-24">{title}</div>
      </div>
      <div className="md:col-span-8 space-y-3">{children}</div>
    </section>
  );
}
