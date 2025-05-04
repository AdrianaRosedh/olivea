// components/forms/reservation/CloudbedsInlineIframe.tsx
"use client";

export function CloudbedsInlineIframe() {
  return (
    <iframe
      src="/cloudbeds-inline.html"
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
}