-- 20261028g_batch_b.sql
--
-- Final sweep, Batch B: hand-written copies rebuilt from the admin.
--
--   sustainability_content.faq          the Philosophy page's five questions
--                                         (were in code, sustainability/faq.ts)
--   sustainability_content.description  the Philosophy article's intro line
--   press_content.michelin_band         the MICHELIN band atop the Press page
--                                         (was in code, MichelinBand.tsx)
--   home_content.hero.badge             the "One MICHELIN Star · Green Star"
--                                         line by the home Reserve button
--
-- Seeded with the wording live on 2026-10-28, so nothing visible changes.

begin;

alter table public.sustainability_content add column if not exists faq jsonb not null default '[]'::jsonb;
alter table public.press_content add column if not exists michelin_band jsonb not null default '{}'::jsonb;

update public.sustainability_content
  set faq = $j$[
  {
    "id": "faq_cd51bf54e4f8",
    "q": {
      "es": "¿Por qué se llama Olivea? ¿Qué significa el nombre Olivea?",
      "en": "Why is it called Olivea? What does the name Olivea mean?"
    },
    "a": {
      "es": "Olivea (IPA /oˈli.βe.a/ — o-LEE-beh-a) es un nombre femenino de origen latino, derivado de oliva, el olivo. El olivo simboliza paz, prosperidad, sabiduría y continuidad: crece lento, se adapta y perdura. Para Olivea este significado no es simbólico — es estructural.",
      "en": "Olivea (IPA /oˈli.βe.a/ — o-LEE-beh-a) is a feminine name of Latin origin, derived from oliva, the olive. The olive tree symbolizes peace, prosperity, wisdom, and continuity: it grows slowly, adapts, and endures. For Olivea this meaning is not symbolic — it is structural."
    }
  },
  {
    "id": "faq_ddc024fdd0b9",
    "q": {
      "es": "¿Qué es Olivea?",
      "en": "What is Olivea?"
    },
    "a": {
      "es": "Olivea no es un hotel, ni un restaurante, ni un café — es un ecosistema en Valle de Guadalupe, Baja California, México. Casa Olivea (la estancia de campo), Olivea Farm To Table (el restaurante con estrella MICHELIN) y Olivea Café Wine Bar son expresiones distintas de un mismo centro, unificadas por una filosofía y un huerto vivo.",
      "en": "Olivea is not a hotel, a restaurant, or a café — it is an ecosystem in Valle de Guadalupe, Baja California, Mexico. Casa Olivea (the farm stay), Olivea Farm To Table (the MICHELIN-starred restaurant), and Olivea Café Wine Bar are different expressions of the same core, unified by one philosophy and one working garden."
    }
  },
  {
    "id": "faq_f97ab39b2935",
    "q": {
      "es": "¿Qué significa el logo de Olivea?",
      "en": "What does the Olivea logo mean?"
    },
    "a": {
      "es": "El logo es un alebrije — en la cultura mexicana, un ser mítico e híbrido compuesto de distintos animales, donde cada parte carga un significado. El alebrije de Olivea es un insecto: una oliva como cuerpo, hojas de olivo como alas y una cabeza de rábano. Cada parte tiene identidad propia; juntas forman algo vivo.",
      "en": "The logo is an alebrije — in Mexican culture, a mythical hybrid being assembled from different animals, each part carrying meaning. Olivea's alebrije is an insect: an olive as the body, olive leaves as wings, and a radish as the head. Individually each part has its own identity; together they form something alive."
    }
  },
  {
    "id": "faq_e21627af5299",
    "q": {
      "es": "¿Cómo es sustentable Olivea?",
      "en": "How is Olivea sustainable?"
    },
    "a": {
      "es": "En Olivea la sustentabilidad es eficiencia — no como tendencia ni como etiqueta, sino como respeto hecho práctica. En Valle de Guadalupe el agua es finita y la electricidad es poco confiable, así que la sustentabilidad es infraestructura y no ideología: energía solar, agua que se reutiliza en lugar de desecharse, y un ciclo que lleva el huerto por las cocinas y de vuelta a la tierra.",
      "en": "At Olivea sustainability is efficiency — not a trend and not a label, but respect made practical. In Valle de Guadalupe water is finite and electricity is unreliable, so sustainability is infrastructure rather than ideology: solar energy, water reused rather than discarded, and a cycle that carries the garden through the kitchens and back to the soil."
    }
  },
  {
    "id": "faq_075d9e0fbaf8",
    "q": {
      "es": "¿Cuándo abrió Olivea?",
      "en": "When did Olivea open?"
    },
    "a": {
      "es": "Olivea abrió a finales del verano de 2023. Al principio se concibió como algo simple — un lugar tranquilo y fácil de operar — pero conforme se trabajó la tierra y el huerto comenzó a responder, quedó claro que el proyecto pedía más intención, no más escala.",
      "en": "Olivea opened in late summer of 2023. It was first conceived as something simple — a calm, easy-to-operate retreat — but as the land was worked and the garden began to respond, it became clear the project was asking for more intention rather than more scale."
    }
  }
]$j$::jsonb,
      description = $j${
  "es": "Origen, identidad, eficiencia, innovación, gastronomía y comunidad — del huerto a la mesa.",
  "en": "Origin, identity, efficiency, innovation, gastronomy, and community — from garden to table."
}$j$::jsonb
  where id = 'singleton' and faq = '[]'::jsonb;

update public.press_content
  set michelin_band = $j${
  "guideLabel": {
    "es": "Guía MICHELIN",
    "en": "MICHELIN Guide"
  },
  "heading": {
    "es": "Una Estrella MICHELIN · Estrella Verde MICHELIN",
    "en": "One MICHELIN Star · MICHELIN Green Star"
  },
  "restaurant": {
    "es": "Olivea Farm To Table · 2025 y 2026",
    "en": "Olivea Farm To Table · 2025 and 2026"
  },
  "hotel": {
    "es": "Casa Olivea · en la Guía MICHELIN (hoteles)",
    "en": "Casa Olivea · in the MICHELIN Guide (hotels)"
  },
  "linkLabel": {
    "es": "Ver en la Guía MICHELIN",
    "en": "View in the MICHELIN Guide"
  }
}$j$::jsonb
  where id = 'singleton' and michelin_band = '{}'::jsonb;

update public.home_content
  set hero = coalesce(hero, '{}'::jsonb) || jsonb_build_object('badge', $j${
  "es": "Una Estrella MICHELIN · Estrella Verde",
  "en": "One MICHELIN Star · Green Star"
}$j$::jsonb)
  where id = 'home';

commit;
