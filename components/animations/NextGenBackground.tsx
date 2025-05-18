"use client";

// Pure on-brand background gradient layer without bird
export default function NextGenBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Gradient layer */}
      <div className="absolute inset-0 gradient-layer" />

      <style jsx>{`
        .gradient-layer {
          background: linear-gradient(
            to bottom,
            hsl(calc(30 + var(--scroll-per) * 10), 35%, 92%) 0%,   /* soft sand */
            hsl(calc(30 + var(--scroll-per) * 10), 28%, 82%) 50%,  /* gentle midtone */
            hsl(calc(30 + var(--scroll-per) * 10), 22%, 72%) 100%  /* muted wood tone */
          );
          transition: background 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
