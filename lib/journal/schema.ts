// lib/journal/schema.ts
import { z } from "zod";

export const JournalLang = z.enum(["es", "en"]);
export type JournalLang = z.infer<typeof JournalLang>;

export const JournalPillar = z.enum([
  // canonical
  "territorio",
  "comite",
  "equipo",
  "colibries",
  "cocina",
  "vision",

  // additional Spanish-friendly
  "huerto",
  "sostenibilidad",
  "hospitalidad",

  // additional English-friendly
  "garden",
  "sustainability",
  "hospitality",
  "cuisine",
]);
export type JournalPillar = z.infer<typeof JournalPillar>;

/** For "best places" list posts */
const SeoItemListItem = z.object({
  name: z.string().min(1),
  url: z.string().min(1).optional(), // absolute or relative ok
  description: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  geo: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  image: z.string().min(1).optional(),
});

const SeoItemList = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  items: z.array(SeoItemListItem).min(1),
});

const SeoFaqItem = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const JournalFrontmatterSchema = z.object({
  id: z.string().min(3),
  lang: JournalLang,
  translationId: z.string().min(3),

  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),

  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

  pillar: JournalPillar,
  tags: z.array(z.string().min(1)).default([]),

  cover: z
    .object({
      src: z.string().min(1),
      alt: z.string().min(1),
    })
    .optional(),

  seo: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      ogImage: z.string().min(1).optional(),
      canonical: z.string().min(1).optional(),
      noindex: z.boolean().optional(),

      /** Optional: editorial keywords (NOT meta keywords) */
      keywords: z.array(z.string().min(1)).optional(),

      /** Optional: structured data for list posts */
      itemList: SeoItemList.optional(),

      /** Optional: structured data for FAQ rich results */
      faq: z.array(SeoFaqItem).optional(),
    })
    .optional(),

  // Optional fields your UI supports
  description: z.string().min(1).optional(),
  author: z
    .union([
      z.string().min(1),
      z.object({
        id: z.string().min(1).optional(),
        name: z.string().min(1),
      }),
    ])
    .optional(),
});

export type JournalFrontmatter = z.infer<typeof JournalFrontmatterSchema>;