// lib/content/data/heroVideos.ts
// Homepage video configuration — admin can swap active video
// without redeploying or editing component code

import type { HeroVideo } from "../types";

const items: HeroVideo[] = [
  {
    id: "hero-v2-2026",
    label: {
      es: "Video principal del huerto — Enero 2026",
      en: "Main garden hero video — January 2026",
    },
    mobile: {
      webm: "/videos/homepage-mobile.webm",
      mp4: "/videos/homepage-mobile.mp4",
      poster: "/images/hero-mobile.avif",
    },
    desktop: {
      webm: "/videos/homepage-HD.webm",
      mp4: "/videos/homepage-HD.mp4",
      poster: "/images/hero.avif",
    },
    version: "2026-01-15-v2",
    active: true,
  },
];

export default items;
export { items };
