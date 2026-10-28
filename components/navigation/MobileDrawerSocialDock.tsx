"use client";

import type { ReactNode } from "react";
import {
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
  LinkedInIcon,
  SpotifyIcon,
  PinterestIcon,
} from "@/components/icons/SocialIcons";
import defaultGlobal from "@/lib/content/data/global";
import HouseLinkChooser from "@/components/ui/HouseLinkChooser";

const ICONS: Record<string, ReactNode> = {
  youtube: <YouTubeIcon size={20} />,
  instagram: <InstagramIcon size={20} />,
  tiktok: <TikTokIcon size={20} />,
  linkedin: <LinkedInIcon size={20} />,
  spotify: <SpotifyIcon size={20} />,
  pinterest: <PinterestIcon size={20} />,
};

// The same list as the desktop footer: global_settings.socials, edited in
// /admin → Brand & Identity. This had its own copy, and its TikTok link had
// drifted to a different account.
export default function MobileDrawerSocialDock({
  lang,
  socials,
}: {
  lang: "es" | "en";
  /** From /admin (Brand & Identity); the built-in list covers a missing one. */
  socials?: Array<{ platform: string; url: string; label: string }>;
}) {
  const list = socials?.length ? socials : defaultGlobal.socials;
  return (
    <div className="flex gap-5">
      {list.map((it) =>
        // One account or playlist per house: the icon asks which one.
        it.platform === "instagram" || it.platform === "spotify" ? (
          <HouseLinkChooser
            key={it.platform}
            kind={it.platform}
            lang={lang}
            inline
            triggerClassName="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
          >
            {ICONS[it.platform]}
          </HouseLinkChooser>
        ) : (
        <a
          key={it.platform}
          href={it.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
        >
          {ICONS[it.platform] ?? ICONS.instagram}
        </a>
        )
      )}
    </div>
  );
}
