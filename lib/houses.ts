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
  /** The action line on the phone chooser: what choosing this house does. */
  cue: { es: string; en: string };
  emblem: string;
  /** A portrait photograph of the place (the reservation chooser's cards). */
  photo: string;
};

export const HOUSES: Record<ReservationType, House> = {
  restaurant: {
    name: "Olivea Farm To Table",
    tab: "Farm To Table",
    descriptor: { es: "Restaurante de alta cocina", en: "Fine Dining Restaurant" },
    cue: { es: "Reservar mesa", en: "Book a table" },
    emblem: "/brand/alebrije-1-Green.svg",
    photo: "/images/farm/hero.jpg",
  },
  hotel: {
    name: "Casa Olivea",
    tab: "Casa Olivea",
    descriptor: { es: "Hotel boutique", en: "Boutique Hotel" },
    cue: { es: "Reservar estancia", en: "Book a stay" },
    emblem: "/brand/alebrije-2.svg",
    photo: "/images/casa/hero.jpg",
  },
  cafe: {
    name: "Olivea Café Wine Bar",
    tab: "Café Wine Bar",
    descriptor: { es: "Café · brunch · vino", en: "Coffee · Brunch · Wine" },
    // The café takes no reservations; its pane says so and shows the hours.
    cue: { es: "Sin reservación", en: "Walk-ins welcome" },
    emblem: "/brand/alebrije-3.svg",
    photo: "/images/cafe/hero.jpg",
  },
};

/** The order a guest meets them in: dinner first, then the stay, then the day. */
export const HOUSE_ORDER: ReservationType[] = ["restaurant", "hotel", "cafe"];

/** Each house's own Instagram account (the same ones the structured data
 *  declares as OLIVEA's profiles). The Instagram icon asks which one. */
export const HOUSE_INSTAGRAM: Record<ReservationType, string> = {
  restaurant: "oliveafarmtotable",
  hotel: "casaolivea",
  cafe: "oliveacafe",
};
