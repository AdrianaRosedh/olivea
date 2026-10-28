// components/layout/siteChrome.ts
// What the site's frame shows around every page — the mobile menu's "more"
// links, the copyright line, the social icons — loaded from /admin in the
// main layout and handed down to the drawer and footer.

export type SocialLink = { platform: string; url: string; label: string };

export interface SiteChrome {
  /** Ordered, already prefixed with the language ("/es/press"). */
  moreLinks: Array<{ href: string; label: string }>;
  /** May contain {year}, filled with the current year where it is shown. */
  copyright: string;
  socials: SocialLink[];
}

/** The copyright line with {year} filled in, split after its first sentence
 *  ("© 2026 Inmobiliaria MYA by DH." / "All rights reserved.") so the footer
 *  can join the parts with a dot and the menu can stack them. */
export function copyrightParts(template: string): [string, string] {
  const line = template.replace(/\{year\}/g, String(new Date().getFullYear())).trim();
  const i = line.indexOf(". ");
  return i < 0 ? [line, ""] : [line.slice(0, i + 1), line.slice(i + 2)];
}
