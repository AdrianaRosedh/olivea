// app/root-shell.tsx
// ─────────────────────────────────────────────────────────────────────
// The <html>/<body> shell for routes that carry no locale.
//
// There is no app/layout.tsx any more: the root layout moved under [lang] so
// it could declare the page's real language. Next then requires every other
// top-level branch to supply its own root, and this keeps them from drifting
// into six slightly different copies of the same document skeleton.
//
// Deliberately lean compared with the localised root — no analytics, no
// consent banner, no marketing fonts. These are the admin, the private
// document viewer and internal redirect routes; none of them should be
// dropping cookies or loading the public site's chrome.
// ─────────────────────────────────────────────────────────────────────
import type { ReactNode } from "react";
import { fontsClass } from "./fonts";

export default function RootShell({
  children,
  lang = "es",
}: {
  children: ReactNode;
  /** These routes are not locale-switched; Spanish is the house language. */
  lang?: "es" | "en";
}) {
  return (
    <html lang={lang} className={fontsClass} suppressHydrationWarning>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
