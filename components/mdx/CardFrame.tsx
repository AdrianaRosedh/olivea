// components/mdx/CardFrame.tsx
"use client";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "content" | "wide" | "bleed";
type Align = "center" | "left" | "right";

const widthCls: Record<Width, string> = {
  // cap by safe gutter on md+; mobile uses 92–94vw like before
  narrow:  "w-[min(760px,92vw)] md:w-[min(760px,calc(100vw-var(--dock-gutter,0px)))]",
  content: "w-[min(900px,90vw)] md:w-[min(900px,calc(100vw-var(--dock-gutter,0px)))]",
  wide:    "w-[min(1100px,94vw)] md:w-[min(1100px,calc(100vw-var(--dock-gutter,0px)))]",
  // keep edge-to-edge on mobile, but respect gutter on desktop
  bleed:
    "mx-[calc(50%-50vw)] w-screen px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] " +
    "md:mx-auto md:px-0 md:w-[min(1100px,calc(100vw-var(--dock-gutter,0px)))]",
};

const alignCls: Record<Align, string> = {
  center: "mx-auto",
  left:   "ml-0 mr-auto",
  right:  "ml-auto mr-0",
};

export default function CardFrame({
  width = "content",
  align = "center",
  className,
  children,
}: PropsWithChildren<{ width?: Width; align?: Align; className?: string }>) {
  const container =
    width === "bleed" ? widthCls.bleed : cn(widthCls[width], alignCls[align]);

  return (
    <div className={cn("relative", container, className)}>
      <div className="relative overflow-hidden rounded-[28px] ring-1 ring-black/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </div>
  );
}