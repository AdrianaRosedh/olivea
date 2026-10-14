// components/journal/JournalSlugEnter.tsx
// The article's cover and body fade in on arrival.
//
// CSS-first (Reveal): the entrance plays on first paint and reduced motion is
// handled in CSS. The previous framer-motion version rendered `opacity: 0`
// until it knew the motion preference; with Reduce Motion on, it then dropped
// the animation and the whole article stayed invisible.

import Reveal from "@/components/scroll/Reveal";

export function CoverLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={className} preset="blur-up" distance={10} duration={0.65}>
      {children}
    </Reveal>
  );
}

export function BodyLead({
  children,
  className,
  delay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal className={className} preset="blur-up" distance={14} duration={0.55} delay={delay}>
      {children}
    </Reveal>
  );
}
