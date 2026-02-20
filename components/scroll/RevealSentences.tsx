"use client";

import Reveal, { type RevealPreset } from "./Reveal";

type RevealSentencesProps = {
  text: string;
  each?: number; // seconds between sentences
  start?: number; // initial delay
  preset?: RevealPreset;
  className?: string;
};

function splitSentences(s: string): string[] {
  return s.trim().split(/(?<=[.!?])\s+/g).filter(Boolean);
}

export default function RevealSentences({
  text,
  each = 0.08,
  start = 0,
  preset = "up",
  className = "",
}: RevealSentencesProps) {
  const parts = splitSentences(text);

  return (
    <div className={className}>
      {parts.map((t, i) => (
        <Reveal key={i} preset={preset} delay={start + i * each} distance={22}>
          <p className="leading-relaxed md:text-lg text-(--olivea-olive)">{t}</p>
        </Reveal>
      ))}
    </div>
  );
}