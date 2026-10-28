-- 20261028b_google_listing_fields.sql
--
-- Step 3 of moving hard-coded site text into Supabase. The structured data
-- Google reads (components/seo/StructuredDataServer.tsx) carried each house's
-- description, phone, price level, Maps link, keywords, cuisines and
-- amenities, and Olivea's own description, phone and linked profiles, all
-- written in code. They move to:
--
--   farmtotable_content.listing, casa_content.listing, cafe_content.listing
--     — edited in the "Google listing" card on each house's admin page;
--   global_settings.organization
--     — edited in Brand & Identity.
--
-- Seeded with exactly what Google is given on 2026-10-28, so nothing changes
-- when this runs. Additive only. These tables already allow public SELECT and
-- service-role writes; new columns inherit that.

begin;

alter table public.farmtotable_content add column if not exists listing jsonb not null default '{}'::jsonb;
alter table public.casa_content        add column if not exists listing jsonb not null default '{}'::jsonb;
alter table public.cafe_content        add column if not exists listing jsonb not null default '{}'::jsonb;
alter table public.global_settings     add column if not exists organization jsonb not null default '{}'::jsonb;

update public.farmtotable_content set listing = $j${
  "description": "One MICHELIN Star fine-dining restaurant serving a single prix-fixe holistic tasting menu born from its own working garden — by reservation only, in Valle de Guadalupe, Baja California. It grows its own mushrooms on the property and works with koji and its own ferments in its own laboratory. The fine-dining heart of Olivea; the casual daytime café (Olivea Café Wine Bar) and the farm stay (Casa Olivea) share the same property.",
  "alternateName": "Olivea FTT",
  "keywords": "fine dining, alta cocina, MICHELIN Star, holistic menu, menú holístico, tasting menu, menú degustación, prix fixe, farm-to-table, del huerto, reservation only, Valle de Guadalupe",
  "telephone": "+52 646 383 6402",
  "priceRange": "$$$$",
  "mapsUrl": "https://maps.app.goo.gl/c2RsfNfQom2Jg73P7",
  "servesCuisine": [
    "Fine dining",
    "Tasting menu",
    "Farm-to-table",
    "Contemporary Mexican",
    "Baja California"
  ],
  "amenities": []
}$j$::jsonb where id = 'singleton' and listing = '{}'::jsonb;
update public.casa_content        set listing = $j${
  "description": "The complete Olivea experience — a farm stay that brings together the One-MICHELIN-Star Olivea Farm To Table restaurant, the casual Olivea Café Wine Bar, and the working garden into a single stay in Valle de Guadalupe, Baja California. Farm hospitality where the garden is the essence.",
  "telephone": "+52 646 388 2369",
  "priceRange": "$$$",
  "mapsUrl": "https://maps.app.goo.gl/CnKY7KYNN5yxYtfi8",
  "amenities": [
    "Working garden",
    "Farm-to-table restaurant",
    "Specialty café",
    "In-room coffee machine"
  ]
}$j$::jsonb where id = 'singleton' and listing = '{}'::jsonb;
update public.cafe_content        set listing = $j${
  "description": "Café and wine bar on Olivea's working-garden property in Valle de Guadalupe, Baja California, open every day, walk-in. Specialty coffee; croissants, conchas, pastries and seasonal breads from its own bakery; breakfast and brunch; Valle de Guadalupe and Baja California wine by the glass and tapas from the garden in the afternoon; its own ferments, shared with Olivea Farm To Table. Lounge sofas look out over the garden, which guests can walk through. The relaxed counterpart to the One-MICHELIN-Star Olivea Farm To Table restaurant.",
  "keywords": "café, wine bar, specialty coffee, bakery, panadería, croissants, conchas, seasonal bread, brunch, breakfast, Valle de Guadalupe wine, Baja California wine, lounge, garden, walk-in, cafetería",
  "telephone": "+52 646 388 2369",
  "priceRange": "$$",
  "mapsUrl": "https://maps.app.goo.gl/gYH1qsUourCZqXiX6",
  "servesCuisine": [
    "Coffee",
    "Bakery",
    "Pastries",
    "Breakfast",
    "Brunch",
    "Wine",
    "Mexican"
  ],
  "amenities": [
    "Lounge with sofas",
    "Garden views",
    "Walk through the working garden",
    "In-house bakery"
  ]
}$j$::jsonb where id = 'singleton' and listing = '{}'::jsonb;
update public.global_settings     set organization = $j${
  "alternateName": "Familia Olivea",
  "description": "Farm hospitality in Valle de Guadalupe, Baja California — MICHELIN-starred restaurant, farm stay, and café born from a working garden.",
  "telephone": "+52 646 383 6402",
  "areaServed": "Valle de Guadalupe, Ensenada, Baja California, Mexico",
  "knowsAbout": [
    "Farm hospitality",
    "Farm-to-table dining",
    "Agritourism",
    "Valle de Guadalupe wine region",
    "Baja California gastronomy",
    "Fermentation and koji",
    "In-house mushroom cultivation",
    "Bread and pastry"
  ],
  "sameAs": [
    "https://www.instagram.com/oliveafarmtotable",
    "https://www.instagram.com/oliveacafewine",
    "https://www.instagram.com/casaolivea",
    "https://www.facebook.com/oliveafarmtotable",
    "https://www.facebook.com/oliveacafe",
    "https://www.facebook.com/casaolivea",
    "https://www.youtube.com/grupoolivea",
    "https://www.tiktok.com/@familiaolivea"
  ]
}$j$::jsonb where id = 'singleton' and organization = '{}'::jsonb;

commit;
