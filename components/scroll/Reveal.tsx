"use client";

import { motion, type Transition, type MotionProps } from "framer-motion";
import type { PropsWithChildren, ReactElement, ElementType } from "react";

export type RevealPreset =
  | "fade"
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale-in"
  | "zoom-out"
  | "blur-up";

export type RevealProps = {
  preset?: RevealPreset;
  distance?: number;     // px
  duration?: number;     // s
  delay?: number;        // s
  once?: boolean;
  amount?: number | "some" | "all";
  className?: string;
  as?: ElementType;
  transition?: Transition;
  initialProps?: MotionProps["initial"];
  whileInViewProps?: MotionProps["whileInView"];
};

export default function Reveal({
  children,
  preset = "up",
  distance = 24,
  duration = 0.7,
  delay = 0,
  once = true,
  amount = "some",
  className = "",
  as,
  transition,
  initialProps,
  whileInViewProps,
}: PropsWithChildren<RevealProps>): ReactElement {
  const Comp = motion(as ?? "div");
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const base = (() => {
    switch (preset) {
      case "fade":
        return { initial: { opacity: 0 }, whileInView: { opacity: 1 } };
      case "up":
        return { initial: { opacity: 0, y: distance }, whileInView: { opacity: 1, y: 0 } };
      case "down":
        return { initial: { opacity: 0, y: -distance }, whileInView: { opacity: 1, y: 0 } };
      case "left":
        return { initial: { opacity: 0, x: -distance }, whileInView: { opacity: 1, x: 0 } };
      case "right":
        return { initial: { opacity: 0, x: distance }, whileInView: { opacity: 1, x: 0 } };
      case "scale-in":
        return { initial: { opacity: 0, scale: 0.96 }, whileInView: { opacity: 1, scale: 1 } };
      case "zoom-out":
        return { initial: { opacity: 0, scale: 1.06 }, whileInView: { opacity: 1, scale: 1 } };
      case "blur-up":
        return {
          initial: { opacity: 0, y: distance, filter: "blur(6px)" },
          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        };
      default:
        return { initial: { opacity: 0 }, whileInView: { opacity: 1 } };
    }
  })();

  return (
    <Comp
      className={className}
      initial={initialProps ?? base.initial}
      whileInView={whileInViewProps ?? base.whileInView}
      transition={transition ?? { duration, delay, ease }}
      viewport={{ once, amount, margin: "0px 0px -20% 0px" }}
    >
      {children}
    </Comp>
  );
}