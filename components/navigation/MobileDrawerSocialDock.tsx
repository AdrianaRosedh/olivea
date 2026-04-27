"use client";

import {
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
  LinkedInIcon,
  SpotifyIcon,
  PinterestIcon,
} from "@/components/icons/SocialIcons";

type Item = {
  id: "yt" | "ig" | "tt" | "li" | "sp" | "pt";
  href: string;
  label: string;
};

const SOCIAL: Item[] = [
  { id: "yt", href: "https://www.youtube.com/@GrupoOlivea", label: "YouTube" },
  { id: "ig", href: "https://instagram.com/oliveafarmtotable/", label: "Instagram" },
  { id: "tt", href: "https://www.tiktok.com/@grupoolivea", label: "TikTok" },
  { id: "li", href: "https://www.linkedin.com/company/inmobiliaria-casa-olivea/", label: "LinkedIn" },
  { id: "sp", href: "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8", label: "Spotify" },
  { id: "pt", href: "https://mx.pinterest.com/familiaolivea/", label: "Pinterest" },
];

function iconFor(id: Item["id"]) {
  switch (id) {
    case "yt":
      return <YouTubeIcon size={20} />;
    case "ig":
      return <InstagramIcon size={20} />;
    case "tt":
      return <TikTokIcon size={20} />;
    case "li":
      return <LinkedInIcon size={20} />;
    case "sp":
      return <SpotifyIcon size={20} />;
    case "pt":
      return <PinterestIcon size={20} />;
  }
}

export default function MobileDrawerSocialDock() {
  return (
    <div className="flex gap-5">
      {SOCIAL.map((it) => (
        <a
          key={it.id}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
        >
          {iconFor(it.id)}
        </a>
      ))}
    </div>
  );
}
