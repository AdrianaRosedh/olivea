-- 20261028d_contact_faq.sql
--
-- Final sweep, Contact. The Contact page's FAQ lived only in code
-- (app/[lang]/(main)/contact/faq.ts) and its hidden search article was a
-- hand-written copy that had drifted: it listed the restaurant as open
-- Wednesday, Friday and Sunday and gave Casa and the café one shared schedule.
--
-- 1. contact_content.faq: the questions, edited in /admin -> Contact. Answers
--    may contain {hours}, {address}, {email}, {phone} and
--    {restaurantPhone}, filled at render time from /admin/hours, site
--    settings and the restaurant's Google listing — so no fact is typed twice.
-- 2. contact_content.labels gains phone, hours, events and faqHeading, the
--    few words the article and FAQ need.
--
-- Seeded with the live wording. Additive only: no existing value changes.

begin;

alter table public.contact_content add column if not exists faq jsonb not null default '[]'::jsonb;

update public.contact_content
  set faq = $j$[
  {
    "id": "faq_8e2d4baee87e",
    "q": {
      "en": "What are Olivea's opening hours?",
      "es": "¿Cuáles son los horarios de Olivea?"
    },
    "a": {
      "en": "Each experience keeps its own hours. {hours} Olivea Farm To Table is by reservation only.",
      "es": "Cada experiencia tiene su propio horario. {hours} Olivea Farm To Table es solo con reservación."
    }
  },
  {
    "id": "faq_3e84b226913b",
    "q": {
      "en": "Where is Olivea located?",
      "es": "¿Dónde está Olivea?"
    },
    "a": {
      "en": "Olivea is in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California, Mexico: {address}. Olivea Farm To Table, Casa Olivea, and Olivea Café Wine Bar share one property and one garden.",
      "es": "Olivea está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California, México: {address}. Olivea Farm To Table, Casa Olivea y Olivea Café Wine Bar comparten la misma propiedad y el mismo huerto."
    }
  },
  {
    "id": "faq_75c2faf65d3b",
    "q": {
      "en": "Is Olivea in Valle de Guadalupe or Ensenada?",
      "es": "¿Olivea está en Valle de Guadalupe o en Ensenada?"
    },
    "a": {
      "en": "Both: Olivea is in Valle de Guadalupe (Villa de Juárez), which sits within Ensenada, Baja California.",
      "es": "Ambos: Olivea está en Valle de Guadalupe (Villa de Juárez), que forma parte del municipio de Ensenada, Baja California."
    }
  },
  {
    "id": "faq_fd829a5be27c",
    "q": {
      "en": "How do I contact Olivea?",
      "es": "¿Cómo contacto a Olivea?"
    },
    "a": {
      "en": "Write to {email} or call {phone}. Olivea Farm To Table has its own direct line: {restaurantPhone}.",
      "es": "Escríbenos a {email} o llama al {phone}. Olivea Farm To Table tiene línea directa: {restaurantPhone}."
    }
  }
]$j$::jsonb
  where id = 'singleton' and faq = '[]'::jsonb;

update public.contact_content
  set labels = $j${
  "phone": {
    "en": "Phone",
    "es": "Teléfono"
  },
  "hours": {
    "en": "Hours",
    "es": "Horario"
  },
  "events": {
    "en": "Special events",
    "es": "Eventos especiales"
  },
  "faqHeading": {
    "en": "Common questions",
    "es": "Preguntas frecuentes"
  }
}$j$::jsonb || coalesce(labels, '{}'::jsonb)
  where id = 'singleton';

commit;
