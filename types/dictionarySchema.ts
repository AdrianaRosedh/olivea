import { z } from "zod";

/** Reusable, backward-compatible SEO meta block */
const MetaSEO = z.object({
  title:       z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keywords:    z.array(z.string().min(1)).optional(),
  ogImage:     z.string().min(1).optional(),  // path or absolute URL
}).optional();

/** Convenience helper for page objects that get a meta block */
const pageWithMeta = (shape: Record<string, z.ZodTypeAny>) =>
  z.object(shape).extend({ meta: MetaSEO });

export const dictionarySchema = z.object({
  about: pageWithMeta({
    title:       z.string(),
    description: z.string(),
  }),

  cafe: pageWithMeta({
    title:       z.string(),
    description: z.string(),
    error:       z.string(),
  }),

  casa: pageWithMeta({
    title:       z.string(),
    description: z.string(),
  }),

  farmtotable: pageWithMeta({
    title:       z.string(),
    description: z.string(),
  }),

  mesadelvalle: pageWithMeta({
    title:   z.string(),
    tagline: z.string(),
    description: z.array(z.string()),
  }),

  contact:        pageWithMeta({ title: z.string(), description: z.string() }),
  sustainability: pageWithMeta({ title: z.string(), description: z.string() }),

  journal: pageWithMeta({
    title:    z.string(),
    subtitle: z.string(),
    loading:  z.string(),
    empty:    z.string(),
    error:    z.string(),
    by:       z.string(),
  }),

  legal:        pageWithMeta({ title: z.string(), description: z.string() }),

  notFound: z.object({
    message: z.string(),
    cta:     z.string(),
    meta:    MetaSEO, // optional SEO for 404
  }),

  home: pageWithMeta({
    title:          z.string(),
    subtitle:       z.string(),
    cta_restaurant: z.string(),
    cta_casa:       z.string(),
  }),

  /** site-wide metadata */
  metadata: z.object({
    description: z.string(),
    siteName:    z.string().optional(),
    twitter:     z.string().optional(),
    ogDefault:   z.string().optional(),
  }).optional(),

  drawer: z.object({
    main: z.object({
      farmtotable: z.string(),
      casa:        z.string(),
      cafe:        z.string(),
    }),
    more: z.object({
      journal:        z.string(),
      sustainability: z.string(),
      awards:         z.string(),
      contact:        z.string(),
      legal:          z.string(),
      // optional extras you have in the JSON
      seeMore:        z.string().optional(),
      hide:           z.string().optional(),
    }),
  }),

  footer: z.object({
    careers: z.string(),
    legal:   z.string(),
  }),
});

// for convenience later in your loader:
export type Dictionary = z.infer<typeof dictionarySchema>;