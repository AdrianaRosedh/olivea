"use client";

type Props = {
  className?: string;
};

export function CloudbedsImmersiveIframe({ className }: Props) {
  return (
    <iframe
      src="/cloudbeds-immersive.html"
      title="Casa Olivea Booking"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
      className={className ?? "w-full h-full border-0"}
    />
  );
}