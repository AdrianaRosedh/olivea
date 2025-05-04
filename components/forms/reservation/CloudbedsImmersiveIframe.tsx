"use client";

type Props = { className?: string };

export function CloudbedsImmersiveIframe({ className }: Props) {
  return (
    <iframe
      src="/cloudbeds-immersive.html"
      title="Casa Olivea Booking"
      className={className ?? "absolute inset-0 w-full h-full border-0"}
      // you can drop sandbox if it prevents the script from running:
      // sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}