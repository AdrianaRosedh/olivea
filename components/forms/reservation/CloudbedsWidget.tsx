"use client";

type Props = {
  autoLaunch?: boolean;
};

export default function CloudbedsWidget({ autoLaunch }: Props) {
  if (!autoLaunch) return null;

  return (
    <div className="w-full h-full flex justify-center">
      <iframe
        src="/cloudbeds-immersive.html"
        title="Reservas Casa Olivea"
        className="w-full h-[70vh] md:h-[75vh] rounded-lg border border-[var(--olivea-olive)]/20 shadow-sm"
        loading="lazy"
      />
    </div>
  );
}
