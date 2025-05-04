// components/forms/reservation/CloudbedsImmersiveIframe.tsx
"use client";

export function CloudbedsImmersiveIframe() {
  return (
    <iframe
      src="/cloudbeds-immersive.html"
      title="Hotel booking"
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}