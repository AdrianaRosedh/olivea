// components/forms/reservation/CloudbedsWidget.tsx
"use client";

export default function CloudbedsWidget({
  lang = "es",
}: {
  lang?: "es" | "en";
}) {
  // If later you create /cloudbeds-immersive-en.html
  const src =
    lang === "en"
      ? "/cloudbeds-immersive.html?lang=en"
      : "/cloudbeds-immersive.html";

  return (
    <div
      className="relative w-full bg-[var(--olivea-cream)]"
      data-lenis-prevent
    >
      {/* Olivea loader overlay while the iframe boots */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
        <div className="px-4 py-2 rounded-full border border-[var(--olivea-olive)]/40 bg-[var(--olivea-cream)]/90 text-[10px] uppercase tracking-[0.18em] text-[var(--olivea-ink)]/70">
          Cargando motor seguro…
        </div>
      </div>

      {/* The Immersive 2.0 experience lives inside this iframe */}
      <iframe
        src={src}
        title="Reservas Casa Olivea"
        className="w-full h-[80vh] md:h-[85vh] border-0"
        loading="lazy"
        scrolling="yes"
      />
    </div>
  );
}
