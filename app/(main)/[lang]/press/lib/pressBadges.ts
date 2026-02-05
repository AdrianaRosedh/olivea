// app/(main)/[lang]/press/lib/pressBadges.ts
import type { Lang, PressItem } from "../pressTypes";

export type AwardBadge = {
  key: string;
  test: (it: PressItem) => boolean;
  label: (lang: Lang, it: PressItem) => string;
  src: string;

  // ✅ Optional per-badge visual override (for “padded” SVGs)
  imgClassName?: string;
};

export const AWARD_BADGES: AwardBadge[] = [
  {
    key: "michelin-guide-hotel",
    test: (it) =>
      it.kind === "award" && it.for === "hotel" && /michelin/i.test(it.issuer),
    label: () => "MICHELIN Guide",
    src: "/images/press/awards/michelinGuide.svg",
  },
  {
    key: "michelin-star",
    test: (it) =>
      it.kind === "award" &&
      it.for === "restaurant" &&
      /michelin/i.test(it.issuer) &&
      (/star|estrella/i.test(it.title) ||
        (it.tags ?? []).some((t) => /star|estrella/i.test(t))),
    label: (lang) => (lang === "es" ? "Estrella MICHELIN" : "MICHELIN Star"),
    src: "/images/press/awards/michelin.svg",
  },
  {
    key: "green-star",
    test: (it) =>
      it.kind === "award" &&
      it.for === "restaurant" &&
      (it.tags ?? []).some((t) =>
        /green\s*star|estrella\s*verde|verde/i.test(t)
      ),
    label: () => "Green Star",
    src: "/images/press/awards/michelin-green-star.svg",
  },
  {
    key: "mb100",
    test: (it) =>
      it.kind === "award" &&
      (/mb100/i.test(it.issuer) ||
        (it.tags ?? []).some((t) => /mb100/i.test(t))),
    label: () => "MB100",
    src: "/images/press/awards/MB100.svg",
    imgClassName: "scale-[1.35]",
  },

  // ✅ Culinaria Mexicana / México Gastronómico (SVG has extra padding → scale up)
  {
    key: "culinaria-mexicana",
    test: (it) =>
      it.kind === "award" &&
      it.for === "restaurant" &&
      /culinaria\s*mexicana|méxico\s*gastronómico|mexico\s*gastronomico/i.test(
        `${it.issuer} ${it.title} ${(it.tags ?? []).join(" ")}`
      ),
    label: () => "Culinaria Mexicana",
    src: "/images/press/awards/culinariamexicana.svg",

    // 👇 tweak only this logo
    imgClassName: "scale-[1.35]",
  },
];

export function getAwardBadges(it: PressItem, lang: Lang) {
  if (it.kind !== "award") return [];
  return AWARD_BADGES.filter((b) => b.test(it)).map((b) => ({
    key: b.key,
    src: b.src,
    label: b.label(lang, it),
    imgClassName: b.imgClassName,
  }));
}
