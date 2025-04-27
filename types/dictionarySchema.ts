import { z } from "zod"

export const dictionarySchema = z.object({
  about: z.object({
    title: z.string(),
    description: z.string(),
  }),
  cafe: z.object({
    title: z.string(),
    description: z.string(),
    error: z.string(),
  }),
  casa: z.object({
    title: z.string(),
    description: z.string(),
    sections: z.object({
      rooms: z.object({
        title: z.string(),
        description: z.string(),
      }),
      breakfast: z.object({
        title: z.string(),
        description: z.string(),
      }),
      experiences: z.object({
        title: z.string(),
        description: z.string(),
      }),
      location: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
  }),
  contact: z.object({
    title: z.string(),
    description: z.string(),
  }),
  sustainability: z.object({
    title: z.string(),
    description: z.string(),
  }),
  journal: z.object({
    title: z.string(),
    subtitle: z.string(),
    loading: z.string(),
    empty: z.string(),
    error: z.string(),
    by: z.string(),
  }),
  legal: z.object({
    title: z.string(),
    description: z.string(),
  }),
  reservations: z.object({
    title: z.string(),
    description: z.string(),
  }),
  restaurant: z.object({
    title: z.string(),
    description: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
    cta: z.string(),
  }),
  home: z.object({
    title: z.string(),
    subtitle: z.string(),
    cta_restaurant: z.string(),
    cta_casa: z.string(),
  }),
  metadata: z
    .object({
      description: z.string(),
    })
    .optional(),
})
