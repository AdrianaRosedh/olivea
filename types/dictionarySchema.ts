import { z } from "zod";

/** Reusable, backward-compatible SEO meta block */
const MetaSEO = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    keywords: z.array(z.string().min(1)).optional(),
    ogImage: z.string().min(1).optional(), // path or absolute URL
  })
  .optional();

/** Convenience helper for page objects that get a meta block */
const pageWithMeta = (shape: Record<string, z.ZodTypeAny>) =>
  z.object(shape).extend({ meta: MetaSEO });

export const dictionarySchema = z.object({
  /* ---------------- STATIC / CORE PAGES ---------------- */

  team: pageWithMeta({
    title: z.string(),
    description: z.string(),
  }),

  cafe: pageWithMeta({
    title: z.string(),
    description: z.string(),
    error: z.string(),
  }),

  casa: pageWithMeta({
    title: z.string(),
    description: z.string(),
  }),

  farmtotable: pageWithMeta({
    title: z.string(),
    description: z.string(),
  }),

  press: pageWithMeta({
    title: z.string(),
    tagline: z.string(),
    description: z.array(z.string()),
  }),

  /* ---------------- CONTACT (STRICT, FULL) ---------------- */

  contact: pageWithMeta({
    /* legacy / generic */
    title: z.string(),
    description: z.string(),

    /* SEO overrides (used by Contact page metadata) */
    metaTitle: z.string(),
    metaDescription: z.string(),

    /* Page header */
    kicker: z.string(),
    subtitle: z.string(),

    /* Quick actions */
    actions: z.object({
      maps: z.string(),
      email: z.string(),
      call: z.string(),
    }),

    /* Labels */
    labels: z.object({
      address: z.string(),
      email: z.string(),
    }),

    /* Section titles */
    sections: z.object({
      farmToTableTitle: z.string(),
      casaCafeTitle: z.string(),
    }),

    /* Opening hours */
    hours: z.object({
      farmToTable: z.string(),
      casaCafe: z.string(),
    }),

    /* Footer note */
    footerNote: z.string(),

    /* Map UI */
    map: z.object({
      iframeTitle: z.string(),
      badgeLabel: z.string(),
      badgeValue: z.string(),
      googleMapsCta: z.string(),
    }),
  }),

  /* ---------------- OTHER CONTENT ---------------- */

  sustainability: pageWithMeta({
    title: z.string(),
    description: z.string(),
  }),

  journal: pageWithMeta({
    title: z.string(),
    subtitle: z.string(),
    loading: z.string(),
    empty: z.string(),
    error: z.string(),
    by: z.string(),
  }),

  legal: pageWithMeta({
    title: z.string(),
    description: z.string(),
  }),

  notFound: z.object({
    message: z.string(),
    cta: z.string(),
    meta: MetaSEO,
  }),

  home: pageWithMeta({
    title: z.string(),
    subtitle: z.string(),
    cta_restaurant: z.string(),
    cta_casa: z.string(),
  }),

  /* ---------------- SITE-WIDE METADATA ---------------- */

  metadata: z
    .object({
      description: z.string(),
      siteName: z.string().optional(),
      twitter: z.string().optional(),
      ogDefault: z.string().optional(),
    })
    .optional(),

  /* ---------------- NAV / UI ---------------- */

  drawer: z.object({
    main: z.object({
      farmtotable: z.string(),
      casa: z.string(),
      cafe: z.string(),
    }),
    more: z.object({
      journal: z.string(),
      sustainability: z.string(),
      awards: z.string(),
      contact: z.string(),
      legal: z.string(),
      seeMore: z.string().optional(),
      hide: z.string().optional(),
    }),
  }),

  footer: z.object({
    careers: z.string(),
    legal: z.string(),
  }),
});

/* ---------------- TYPES ---------------- */

export type Dictionary = z.infer<typeof dictionarySchema>;
