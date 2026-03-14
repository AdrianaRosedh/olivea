// lib/perf/watchLCP.ts
//
// Observes all three Core Web Vitals: LCP, CLS, INP.
// The function name stays `watchLCP` for backward compatibility.

const __DEV__ = process.env.NODE_ENV !== "production";

/* ── Types ────────────────────────────────────────────────────── */

export type WebVitalsReport = {
  lcp?: number;
  cls?: number;
  inp?: number;
};

export type Reporter = (report: WebVitalsReport) => void;

type LCPEntry = PerformanceEntry & {
  renderTime?: number;
  loadTime?: number;
};

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  value: number;
};

type EventTimingEntry = PerformanceEntry & {
  duration: number;
  interactionId?: number;
};

/* ── Default reporter ─────────────────────────────────────────── */

function defaultReporter(r: WebVitalsReport) {
  if (!__DEV__) return;
  const parts: string[] = [];
  if (r.lcp !== undefined) parts.push(`LCP ${Math.round(r.lcp)}ms`);
  if (r.cls !== undefined) parts.push(`CLS ${r.cls.toFixed(3)}`);
  if (r.inp !== undefined) parts.push(`INP ${Math.round(r.inp)}ms`);
  if (parts.length) console.log("[Web Vitals]", parts.join(" · "));
}

/* ── Main ─────────────────────────────────────────────────────── */

export function watchLCP(report: Reporter = defaultReporter) {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  const result: WebVitalsReport = {};

  /* ── LCP ──────────────────────────────────────────────────── */
  try {
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as LCPEntry | undefined;
      if (!last) return;
      result.lcp = last.renderTime ?? last.loadTime ?? last.startTime;
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  /* ── CLS (session window algorithm) ──────────────────────── */
  try {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionStart = -1;
    let lastEntry = -1;

    const clsObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (entry.hadRecentInput) continue;

        const now = entry.startTime;
        // New session: gap > 1s or window > 5s
        if (sessionStart < 0 || now - lastEntry > 1000 || now - sessionStart > 5000) {
          sessionStart = now;
          sessionValue = 0;
        }

        sessionValue += entry.value;
        lastEntry = now;

        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          result.cls = clsValue;
        }
      }
    });
    clsObs.observe({ type: "layout-shift", buffered: true });
  } catch {}

  /* ── INP (98th percentile) ───────────────────────────────── */
  try {
    const durations: number[] = [];

    const inpObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as EventTimingEntry[]) {
        if (!entry.interactionId) continue;
        durations.push(entry.duration);
      }

      if (durations.length) {
        durations.sort((a, b) => a - b);
        const idx = Math.min(
          durations.length - 1,
          Math.floor(durations.length * 0.98)
        );
        result.inp = durations[idx];
      }
    });
    inpObs.observe({ type: "event", buffered: true } as PerformanceObserverInit);
  } catch {}

  /* ── Report on page hide ─────────────────────────────────── */
  const onHide = () => {
    if (document.visibilityState === "hidden") {
      report(result);
    }
  };
  document.addEventListener("visibilitychange", onHide);
}
