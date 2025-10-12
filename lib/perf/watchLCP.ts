// app/lib/perf/watchLCP.ts
type LCPEntry = PerformanceEntry & {
  renderTime?: number;
  loadTime?: number;
};

export function watchLCP(report: (valueMs: number) => void = (v) => {
  // Keep logs lightweight in prod; replace with your analytics call if needed
  console.log("LCP", Math.round(v), "ms");
}) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as LCPEntry | undefined;
      if (!last) return;

      const t = last.renderTime ?? last.loadTime ?? last.startTime;
      report(t);
    });

    const opts: PerformanceObserverInit = {
      // Tell TS exactly which entry type we want and to include buffered entries
      type: "largest-contentful-paint",
      buffered: true,
    };

    po.observe(opts);

    // Disconnect when the page is backgrounded to finalize the metric
    const onHide = () => {
      if (document.visibilityState === "hidden") po.disconnect();
    };
    document.addEventListener("visibilitychange", onHide);
  } catch {
    // Silently ignore if the browser doesn't support LCP PO
  }
}