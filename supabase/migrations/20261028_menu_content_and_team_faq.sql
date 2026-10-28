-- 20261028_menu_content_and_team_faq.sql
--
-- Step 2 of moving hard-coded site text into Supabase, so every word is edited
-- from /admin and reaches the page, Google and the AI summary.
--
-- 1. menu_content: the /menu page's own record — its Google title and
--    description and its FAQ, which lived only in code
--    (app/[lang]/(main)/menu/page.tsx and menu/faq.ts). Same shape and rules as
--    the other page records: one row ('singleton'), public read, writes only
--    through the service role (the admin), updated_at kept by the shared
--    trigger.
-- 2. team_content.faq: the Team page's "who is who" FAQ, which lived only in
--    code (app/[lang]/(main)/team/page.tsx). Farm To Table and the café
--    already keep their FAQ in a column of this name.
--
-- Seeded with the exact wording live on 2026-10-28, so nothing on the site
-- changes when this runs. Additive only: no existing column or row changes.

begin;

create table if not exists public.menu_content (
  id text primary key default 'singleton' check (id = 'singleton'),
  meta jsonb not null default '{}'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.menu_content enable row level security;

drop policy if exists "Public read menu_content" on public.menu_content;
create policy "Public read menu_content"
  on public.menu_content for select to public using (true);

drop policy if exists "Service role full menu_content" on public.menu_content;
create policy "Service role full menu_content"
  on public.menu_content for all to service_role using (true) with check (true);

-- Public roles read only (the 2026-10-25 rule for every table).
revoke all on public.menu_content from anon, authenticated;
grant select on public.menu_content to anon, authenticated;

drop trigger if exists set_updated_at on public.menu_content;
create trigger set_updated_at before update on public.menu_content
  for each row execute function update_updated_at();

insert into public.menu_content (id, meta, faq) values (
  'singleton',
  $j${
  "title": {
    "en": "Menu | OLIVEA",
    "es": "Menú | OLIVEA"
  },
  "description": {
    "en": "Seasonal menu for Olivea Farm To Table and Olivea Café Wine Bar — garden-rooted cuisine in Valle de Guadalupe.",
    "es": "Menú de temporada de Olivea Farm To Table y Olivea Café Wine Bar — cocina arraigada al huerto en Valle de Guadalupe."
  }
}$j$::jsonb,
  $j$[
  {
    "id": "faq_3463d995ee35",
    "q": {
      "en": "Is the Olivea Farm To Table menu à la carte or a tasting menu?",
      "es": "¿El menú de Olivea Farm To Table es a la carta o degustación?"
    },
    "a": {
      "en": "It is a holistic menu, served as a single journey: the flavors, the music and the dance between them. This structure allows the kitchen to cook with precision and continuity across the season.",
      "es": "Es un menú holístico, servido como un solo recorrido: los sabores, la música y la danza entre ellos. Esta estructura permite cocinar con continuidad y precisión a lo largo de la temporada."
    }
  },
  {
    "id": "faq_bddcdd3710ff",
    "q": {
      "en": "Is there a vegetarian option?",
      "es": "¿Hay opción vegetariana?"
    },
    "a": {
      "en": "A vegetarian version may be available upon request, depending on the season. Share allergies and dietary restrictions with advance notice at the time of booking and the kitchen adapts thoughtfully while preserving the intent of the menu.",
      "es": "En algunos casos existe una versión vegetariana, según la temporada. Comparte alergias y restricciones alimentarias con aviso previo al momento de reservar y la cocina adapta con cuidado, preservando la intención del menú."
    }
  },
  {
    "id": "faq_00dd98f86aa1",
    "q": {
      "en": "Do you offer wine pairings?",
      "es": "¿Ofrecen maridaje de vinos?"
    },
    "a": {
      "en": "Yes, two: the Premium Pairing, with wines from Valle de Guadalupe and selected international labels, and the Garden Pairing, alcohol-free, created by our team with garden ingredients and flavor science.",
      "es": "Sí, dos: el Maridaje Premium, con vinos del Valle de Guadalupe y etiquetas internacionales seleccionadas, y el Maridaje del Huerto, sin alcohol, creado por nuestro equipo con ingredientes del huerto y ciencia del sabor."
    }
  },
  {
    "id": "faq_759b37f872a3",
    "q": {
      "en": "What is the difference between the Olivea Farm To Table menu and the Olivea Café Wine Bar menu?",
      "es": "¿Cuál es la diferencia entre el menú de Olivea Farm To Table y el de Olivea Café Wine Bar?"
    },
    "a": {
      "en": "Olivea Café Wine Bar is the casual morning experience: walk-in specialty coffee, bread, and breakfast. Olivea Farm To Table is the MICHELIN-starred restaurant, serving a holistic menu in the afternoons and by reservation. Both share the same garden on the same property.",
      "es": "Olivea Café Wine Bar es la experiencia casual de la mañana: café de especialidad, pan y desayuno de entrada libre. Olivea Farm To Table es el restaurante con estrella MICHELIN, con un menú holístico por las tardes y bajo reservación. Ambos comparten el mismo huerto en la misma propiedad."
    }
  },
  {
    "id": "faq_4d33880c7201",
    "q": {
      "en": "How often does the menu change?",
      "es": "¿Cada cuánto cambia el menú?"
    },
    "a": {
      "en": "The holistic menu is seasonal — shaped by the garden and nearby producers, and guided by what the season gives.",
      "es": "El menú holístico es de temporada — moldeado por el huerto y por productores cercanos, y guiado por lo que da la temporada."
    }
  }
]$j$::jsonb
) on conflict (id) do nothing;

alter table public.team_content
  add column if not exists faq jsonb not null default '[]'::jsonb;

update public.team_content
  set faq = $j$[
  {
    "id": "faq_be51921e1d27",
    "q": {
      "es": "¿Quién es el chef de Olivea?",
      "en": "Who is the chef at Olivea?"
    },
    "a": {
      "es": "Daniel Nates es el Chef Ejecutivo de Olivea Farm To Table, el restaurante con estrella MICHELIN en Valle de Guadalupe. Dirige un menú holístico arraigado al huerto y al territorio de Baja California.",
      "en": "Daniel Nates is the Executive Chef of Olivea Farm To Table, the MICHELIN-starred restaurant in Valle de Guadalupe. He leads a garden-led holistic menu rooted in Baja California."
    }
  },
  {
    "id": "faq_872b92f76165",
    "q": {
      "es": "¿Quién fundó Olivea?",
      "en": "Who founded Olivea?"
    },
    "a": {
      "es": "Ange Joy es la fundadora y diseñadora de Olivea — dio forma a los espacios, la estética y el espíritu de bienvenida del restaurante, el hospedaje y el café.",
      "en": "Ange Joy is the founder and designer of Olivea — she shaped the spaces, the aesthetic, and the spirit of welcome across the restaurant, farm stay, and café."
    }
  },
  {
    "id": "faq_43ce4cbab76a",
    "q": {
      "es": "¿Quién es la CEO de Olivea?",
      "en": "Who is the CEO of Olivea?"
    },
    "a": {
      "es": "Adriana Rose es la CEO de Olivea (Tecnología y Visión) y la arquitecta de su ecosistema. También es la fundadora de roseiies, el estudio de inteligencia en hospitalidad detrás de la tecnología de Olivea.",
      "en": "Adriana Rose is the CEO of Olivea (Technology & Vision) and the architect of its ecosystem. She is also the founder of roseiies, the hospitality-intelligence studio behind Olivea's technology."
    }
  },
  {
    "id": "faq_d1f32653aa54",
    "q": {
      "es": "¿Qué es roseiies?",
      "en": "What is roseiies?"
    },
    "a": {
      "es": "roseiies es el estudio de inteligencia en hospitalidad y tecnología fundado por Adriana Rose, CEO de Olivea. Construye los menús vivos, el mapa del huerto y los sistemas operativos de Olivea.",
      "en": "roseiies is the hospitality-intelligence and technology studio founded by Adriana Rose, CEO of Olivea. It builds Olivea's living menus, garden map, and operational systems."
    }
  }
]$j$::jsonb
  where id = 'singleton' and faq = '[]'::jsonb;

commit;
