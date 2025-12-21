// components/journal/ArticleAudioPlayer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Chapter = { t: number; label: string };

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const a = String(mm).padStart(2, "0");
  const b = String(ss).padStart(2, "0");
  return `${a}:${b}`;
}

export default function ArticleAudioPlayer({
  title,
  src,
  chapters,
}: {
  title: string;
  src: string;
  chapters?: Chapter[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);

  const safeChapters = useMemo(() => {
    if (!Array.isArray(chapters)) return [];
    return chapters
      .filter((c) => c && typeof c.t === "number" && typeof c.label === "string")
      .sort((a, b) => a.t - b.t);
  }, [chapters]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onLoaded = () => {
      setD(Number.isFinite(a.duration) ? a.duration : 0);
      setReady(true);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onPause);

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onPause);
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const tick = () => {
      setT(a.currentTime || 0);
      rafRef.current = requestAnimationFrame(tick);
    };

    if (playing) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setT(a.currentTime || 0);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }

  function seek(next: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.min(Math.max(0, next), d || next);
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-black/20">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm opacity-70">Listen</div>
            <div className="text-base font-medium">{title}</div>
          </div>

          <button
            type="button"
            onClick={toggle}
            className="rounded-2xl border border-black/10 px-4 py-2 text-sm hover:opacity-90 dark:border-white/10"
            disabled={!ready}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-12 text-xs tabular-nums opacity-70">{fmt(t)}</span>

          <input
            aria-label="Audio progress"
            className="w-full"
            type="range"
            min={0}
            max={Math.max(1, d || 1)}
            value={Math.min(t, d || t)}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={!ready}
          />

          <span className="w-12 text-right text-xs tabular-nums opacity-70">
            {fmt(d || 0)}
          </span>
        </div>

        {safeChapters.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {safeChapters.map((c) => (
              <button
                key={`${c.t}-${c.label}`}
                type="button"
                onClick={() => seek(c.t)}
                className="rounded-full border border-black/10 px-3 py-1 text-xs hover:opacity-90 dark:border-white/10"
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}

        <audio ref={audioRef} src={src} preload="metadata" />
      </div>
    </div>
  );
}
