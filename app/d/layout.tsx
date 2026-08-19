// app/d/layout.tsx
// ─────────────────────────────────────────────────────────────────────
// Isolates the secure-document pages from all site branding. Overrides the
// site's OLIVEA favicon with a neutral lock, forces noindex, and keeps the
// title generic — so a browser tab, a shared screenshot, or a link preview
// reveals nothing about OLIVEA or the document. Renders children bare (the
// viewer is a full-screen takeover; no site nav/footer here).
// ─────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import "../globals.css";
import RootShell from "../root-shell";

export const metadata: Metadata = {
  title: "Documento protegido",
  description: "Documento privado.",
  robots: { index: false, follow: false },
  // Neutral lock favicon — overrides the site's leaf icon for /d/* only.
  icons: {
    icon: [{ url: "/documento-lock.svg", type: "image/svg+xml" }],
    apple: [{ url: "/documento-lock.svg" }],
  },
  // Kept even though this is now a root layout with no parent metadata to
  // inherit from: null is explicit that a shared /d link must never carry an
  // OLIVEA cover image or site branding, whatever is added above it later.
  openGraph: null,
  twitter: null,
};

// A root layout now, so it owns <html>/<body>. It used to return children
// bare and inherit the document from app/layout.tsx, which no longer exists —
// the root moved under [lang] to declare the page language correctly.
export default function SecureDocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootShell>{children}</RootShell>;
}
