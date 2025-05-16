import { z } from "zod"

// a reusable schema for any `subsections` block
const Subsections = z
  .record(
    z.object({
      title:       z.string(),
      description: z.string(),
    })
  )
  .optional()

export const dictionarySchema = z.object({
  about: z.object({
    title:       z.string(),
    description: z.string(),
  }),

  cafe: z.object({
    title:       z.string(),
    description: z.string(),
    error:       z.string(),
    sections:    z.object({
      all_day:   z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      padel:     z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      community: z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      menu:      z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
    }),
  }),

  casa: z.object({
    title:       z.string(),
    description: z.string(),
    sections:    z.object({
      rooms:       z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      mornings:   z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      experiences: z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      ambience:    z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
    }),
  }),

  restaurant: z.object({
    title:       z.string(),
    description: z.string(),
    sections:    z.object({
      philosophy:        z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      menu_experience:  z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      atmosphere:       z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
      team:             z
        .object({
          title:       z.string(),
          description: z.string(),
        })
        .extend({ subsections: Subsections }),
    }),
  }),

  contact:        z.object({ title: z.string(), description: z.string() }),
  sustainability: z.object({ title: z.string(), description: z.string() }),
  journal:        z.object({
    title:    z.string(),
    subtitle: z.string(),
    loading:  z.string(),
    empty:    z.string(),
    error:    z.string(),
    by:       z.string(),
  }),
  legal:          z.object({ title: z.string(), description: z.string() }),
  reservations:   z.object({ title: z.string(), description: z.string() }),
  notFound:       z.object({ message: z.string(), cta: z.string() }),
  home:           z.object({
    title:         z.string(),
    subtitle:      z.string(),
    cta_restaurant: z.string(),
    cta_casa:      z.string(),
  }),
  metadata:       z
    .object({ description: z.string() })
    .optional(),
    drawer: z.object({
      main: z.object({
        restaurant: z.string(),
        casa: z.string(),
        cafe: z.string(),
      }),
      more: z.object({
        journal: z.string(),
        sustainability: z.string(),
        awards: z.string(),
        contact: z.string(),
        legal: z.string(),
      }),
    }),   
})