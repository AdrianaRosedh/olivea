// components/forms/reservation/CloudbedsImmersiveIframe.tsx
"use client";

type Props = { className?: string };

export function CloudbedsImmersiveIframe({ className }: Props) {
  return (
    <iframe
      src="/cloudbeds-immersive.html"
      title="Casa Olivea Booking"
      className={className ?? "absolute inset-0 w-full h-full border-0"}
      // IMPORTANT: No sandbox attribute here
    />
  );
}
