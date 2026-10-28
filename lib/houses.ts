// lib/houses.ts
// The three houses of OLIVEA: their emblems, photographs and order. Their
// names, short names, descriptors, action lines and Instagram/Spotify links
// are text, edited in /admin → Interface text (Houses, Each house's socials)
// and read with useHouseText (lib/uiText/context.tsx).

import type { ReservationType } from "@/contexts/ReservationContext";

export type House = {
  emblem: string;
  /** A portrait photograph of the place (the reservation chooser's cards). */
  photo: string;
};

export const HOUSES: Record<ReservationType, House> = {
  restaurant: { emblem: "/brand/alebrije-1-Green.svg", photo: "/images/farm/hero.jpg" },
  hotel: { emblem: "/brand/alebrije-2.svg", photo: "/images/casa/hero.jpg" },
  cafe: { emblem: "/brand/alebrije-3.svg", photo: "/images/cafe/hero.jpg" },
};

/** The order a guest meets them in: dinner first, then the stay, then the day. */
export const HOUSE_ORDER: ReservationType[] = ["restaurant", "hotel", "cafe"];
