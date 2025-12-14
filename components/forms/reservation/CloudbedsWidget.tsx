// components/forms/reservation/CloudbedsWidget.tsx
"use client";

export default function CloudbedsWidget({
  lang = "es",
}: {
  lang?: "es" | "en";
}) {
  // Later you can read this in cloudbeds-immersive.html via ?lang=
  const src =
    lang === "en"
      ? "/cloudbeds-immersive.html?lang=en"
      : "/cloudbeds-immersive.html";

  return (
    <div
      className="relative w-full h-full bg-(--olivea-cream)"
      data-lenis-prevent
    >
      <iframe
        src={src}
        title="Reservas Casa Olivea"
        className="w-full h-full border-0"
        loading="lazy"
        scrolling="yes"
      />
    </div>
  );
}
