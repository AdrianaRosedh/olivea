"use client";

type Props = {
  className?: string;
};

export function CloudbedsImmersiveIframe({ className }: Props) {
  return (
    <iframe
      src="/cloudbeds-immersive.html"
      title="Casa Olivea Booking"
      className={className ?? "w-full h-full border-0"}
    />
  );
}