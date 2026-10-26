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

// The same list as the desktop footer (lib/content/data/global.ts). This had
// its own copy, and its TikTok link had drifted to a different account.
export default function MobileDrawerSocialDock({ lang }: { lang: "es" | "en" }) {
  return (
    <div className="flex gap-5">
      {defaultGlobal.socials.map((it) =>
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
