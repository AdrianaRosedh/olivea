// FixedLCP.tsx (keep as CSS-only)
export default function FixedLCP() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      pointerEvents: "none", userSelect: "none",
      backgroundColor: "var(--olivea-olive)",
      width: "100vw", height: "100dvh",
    }}/>
  );
}
