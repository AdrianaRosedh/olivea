// lib/houses.ts
// The three houses of OLIVEA, named once. The home cards, the reservation
// tabs and the reservation chooser all read from here, so the names a guest
// learns on the home page are the ones they find when they reserve.

import type { ReservationType } from "@/contexts/ReservationContext";

export type House = {
  /** The place's own name, the same in both languages. */
  name: string;
  /** Shorter name for the reservation tabs. */
  tab: string;
  /** What kind of place it is. The MICHELIN honours sit above the reserve
   *  button, so this describes the place instead of repeating them. */
  descriptor: { es: string; en: string };
  emblem: string;
};

export const HOUSES: Record<ReservationType, House> = {
  restaurant: {
    name: "Olivea Farm To Table",
    tab: "Farm To Table",
    descriptor: { es: "Restaurante de alta cocina", en: "Fine Dining Restaurant" },
    emblem: "/brand/alebrije-1-Green.svg",
  },
  hotel: {
    name: "Casa Olivea",
    tab: "Casa Olivea",
    descriptor: { es: "Hotel boutique", en: "Boutique Hotel" },
    emblem: "/brand/alebrije-2.svg",
  },
  cafe: {
    name: "Olivea Café Wine Bar",
    tab: "Café Wine Bar",
    descriptor: { es: "Café · brunch · vino", en: "Coffee · Brunch · Wine" },
    emblem: "/brand/alebrije-3.svg",
  },
};

/** The order a guest meets them in: dinner first, then the stay, then the day. */
export const HOUSE_ORDER: ReservationType[] = ["restaurant", "hotel", "cafe"];
