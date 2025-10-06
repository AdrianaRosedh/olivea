// components/scroll/StickyBlock.tsx
"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "side" | "top";

type Props = {
  id?: string;
  /** Title node (usually an <h2>) */
  title: ReactNode;
  /** Layout: 'side' (sticky title on the left) or 'top' (title above). Default: 'side' */
  variant?: Variant;
  /** Width class for the whole block (use to shrink page width near docks).
   *  Default: w-[min(1100px,92vw)]
   */
  containerClassName?: string;
  /** Extra classes on section */
  className?: string;
};

export default function StickyBlock({
  id,
  title,
  children,
  variant = "side",
  containerClassName = "w-[min(1100px,92vw)]",
  className = "",
}: PropsWithChildren<Props>) {
  if (variant === "top") {
    return (
      <section
        id={id}
        className={cn(
          "main-section mx-auto py-12 md:py-20",
          containerClassName,
          className
        )}
      >
        <div className="mb-6 md:mb-8">{title}</div>
        <div className="space-y-6 md:space-y-8">{children}</div>
      </section>
    );
  }

  // Default 'side' layout (sticky title column on the left)
  return (
    <section
      id={id}
      className={cn(
        "main-section mx-auto py-12 md:py-20",
        containerClassName,
        className
      )}
    >
      <div className="grid md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-24">{title}</div>
        </div>
        <div className="md:col-span-8 space-y-6 md:space-y-8">{children}</div>
      </div>
    </section>
  );
}
