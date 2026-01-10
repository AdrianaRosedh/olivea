// lib/journal/schema.ts
import { z } from "zod";

export const JournalLang = z.enum(["es", "en"]);
export type JournalLang = z.infer<typeof JournalLang>;

/**
 * Pillars:
 * - Canonical Olivea pillars (original)
 * - Extra ES/EN-friendly values (so writing dummy posts doesn't break builds)
 *
 * If later you want ONE canonical set for filtering/UI, we can normalize these
 * in lib/journal/load.ts before validation.
 */
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
    })
    .optional(),

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