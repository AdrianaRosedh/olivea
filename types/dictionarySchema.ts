// types/dictionarySchema.ts
import { z } from "zod";

// a reusable schema for any `subsections` block
const Subsections = z
  .record(
    z.object({
      title:       z.string(),
      description: z.string(),
    })
  )
  .optional();

// a reusable schema for each section (rooms, menu, etc)
const Section = z.object({
  title:       z.string(),
  description: z.string(),
  subsections: Subsections,
});

export const dictionarySchema = z.object({
  about: z.object({
    title:       z.string(),
    description: z.string(),
  }),

  cafe: z.object({
    title:       z.string(),
    description: z.string(),
    error:       z.string(),
    // <- now allows any section key (all_day, padel, …) so your JSON can add/remove
    sections:    z.record(Section),
  }),

  casa: z.object({
    title:       z.string(),
    description: z.string(),
    // <- ditto for casa
    sections:    z.record(Section),
  }),

  farmtotable: z.object({
    title:       z.string(),
    description: z.string(),
  }),

  mesadelvalle: z.object({
    title:   z.string(),
    tagline: z.string(),
    description: z.array(z.string()),
  }),

  contact:        z.object({ title: z.string(), description: z.string() }),
  sustainability: z.object({ title: z.string(), description: z.string() }),

  journal: z.object({
    title:    z.string(),
    subtitle: z.string(),
    loading:  z.string(),
    empty:    z.string(),
    error:    z.string(),
    by:       z.string(),
  }),

  legal:        z.object({ title: z.string(), description: z.string() }),
  reservations: z.object({ title: z.string(), description: z.string() }),
  notFound:     z.object({ message: z.string(), cta: z.string() }),

  home: z.object({
    title:          z.string(),
    subtitle:       z.string(),
    cta_restaurant: z.string(),
    cta_casa:       z.string(),
  }),

  metadata: z
    .object({ description: z.string() })
    .optional(),

  drawer: z.object({
    main: z.object({
      farmtotable: z.string(),
      casa:       z.string(),
      cafe:       z.string(),
    }),
    more: z.object({
      journal:        z.string(),
      sustainability: z.string(),
      awards:         z.string(),
      contact:        z.string(),
      legal:          z.string(),
    }),
  }),
  footer: z.object({
    careers: z.string(),
    legal: z.string() 
  }),  
});

// for convenience later in your loader:
export type Dictionary = z.infer<typeof dictionarySchema>;