// app/d/layout.tsx
// ─────────────────────────────────────────────────────────────────────
// Isolates the secure-document pages from all site branding. Overrides the
// site's OLIVEA favicon with a neutral lock, forces noindex, and keeps the
// title generic — so a browser tab, a shared screenshot, or a link preview
// reveals nothing about OLIVEA or the document. Renders children bare (the
// viewer is a full-screen takeover; no site nav/footer here).
// ─────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documento protegido",
  description: "Documento privado.",
  robots: { index: false, follow: false },
  // Neutral lock favicon — overrides the site's leaf icon for /d/* only.
  icons: {
    icon: [{ url: "/documento-lock.svg", type: "image/svg+xml" }],
    apple: [{ url: "/documento-lock.svg" }],
  },
  // Strip inherited OpenGraph/Twitter so a shared /d link preview shows no
  // OLIVEA cover image or site branding — bare title only. (null removes the
  // parent value; undefined would inherit it.)
  openGraph: null,
  twitter: null,
};

export default function SecureDocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
