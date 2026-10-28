-- 20261028e_events.sql
--
-- Final sweep, Mesa Invitada. The /mesa-invitada page kept the whole dinner
-- in code — text in both languages, date, prices, OpenTable link, poster — so
-- each volume needed a developer, and after the date the page and its Event
-- markup would have kept telling Google a scheduled dinner with prices.
--
-- events: one row per dinner, edited in /admin -> Events. The page shows the
-- next upcoming enabled event of its series; when none is upcoming it shows
-- the latest past one as past (no prices, no booking, no Event markup). The
-- WhatsApp button uses Casa's phone from its Google listing.
--
-- Seeded with Mesa Invitada Vol. 03 exactly as live on 2026-10-28, plus a
-- "past" note. Same rules as press_items: the public reads enabled rows only,
-- writes go through the service role.

begin;

create table if not exists public.events (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  series text not null default 'mesa-invitada',
  enabled boolean not null default true,
  event_date date not null,
  poster text,
  share_image text,
  booking_url text,
  dinner_price integer,
  stay_price integer,
  copy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_series_date on public.events (series, event_date);

alter table public.events enable row level security;

drop policy if exists "Public read events" on public.events;
create policy "Public read events"
  on public.events for select to public using (enabled = true);

drop policy if exists "Service role write events" on public.events;
create policy "Service role write events"
  on public.events for all to service_role using (true) with check (true);

revoke all on public.events from anon, authenticated;
grant select on public.events to anon, authenticated;

drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at before update on public.events
  for each row execute function update_updated_at();

insert into public.events (id, series, event_date, poster, share_image, booking_url, dinner_price, stay_price, copy)
values ('mesa-invitada-03', 'mesa-invitada', '2026-11-01', '/images/events/mesa-invitada-03/poster-v6.jpg', '/images/seo/mesa-invitada-03-share-v6.jpg',
        'https://www.opentable.com.mx/booking/experiences-availability?rid=1313743&restref=1313743&experienceId=818362&utm_source=olivea&utm_medium=website&utm_campaign=mesa-invitada-03', 2550, 11001,
        $j${
  "eventName": {
    "es": "Mesa Invitada Vol. 03",
    "en": "Mesa Invitada Vol. 03"
  },
  "metaTitle": {
    "es": "Mesa Invitada Vol. 03 · Cena de Día de Muertos + Estancia en Casa Olivea",
    "en": "Mesa Invitada Vol. 03 · Día de Muertos Dinner + Stay at Casa Olivea"
  },
  "metaDescription": {
    "es": "Domingo 1 de noviembre, cena de Día de Muertos con el chef Fernando Hernández (Moyuelo): $2,550 MXN por persona con maridaje. O la estancia completa: 2 noches en Casa Olivea + la cena por $11,001 MXN para 2 personas, impuestos incluidos.",
    "en": "Sunday, November 1, a Día de Muertos dinner with chef Fernando Hernández (Moyuelo): $2,550 MXN per person with pairing. Or the full stay: 2 nights at Casa Olivea + the dinner for $11,001 MXN for 2 guests, taxes included."
  },
  "kicker": {
    "es": "Mesa Invitada · Volumen 03",
    "en": "Mesa Invitada · Volume 03"
  },
  "occasion": {
    "es": "Día de Muertos",
    "en": "Día de Muertos"
  },
  "title": {
    "es": "Cena de Día de Muertos y estancia en Casa Olivea",
    "en": "A Día de Muertos dinner and a stay at Casa Olivea"
  },
  "chefLabel": {
    "es": "Chef invitado",
    "en": "Guest chef"
  },
  "chef": {
    "es": "Fernando Hernández",
    "en": "Fernando Hernández"
  },
  "chefOf": {
    "es": "Moyuelo · Bib Gourmand MICHELIN",
    "en": "Moyuelo · MICHELIN Bib Gourmand"
  },
  "when": {
    "es": "Domingo 1 de noviembre",
    "en": "Sunday, November 1"
  },
  "where": {
    "es": "Olivea Farm To Table · Valle de Guadalupe, Baja California",
    "en": "Olivea Farm To Table · Valle de Guadalupe, Baja California"
  },
  "intro": {
    "es": "Para el Día de Muertos abrimos nuestra mesa al chef Fernando Hernández, de Moyuelo. Juntos cocinamos un menú creado desde el huerto de Olivea, acompañado de su maridaje: una sola noche para recordar a quienes nos dieron de comer.",
    "en": "For Día de Muertos we open our table to chef Fernando Hernández of Moyuelo. Together we cook a menu drawn from the Olivea garden, served with its pairing: one night to remember the people who fed us."
  },
  "dinnerKicker": {
    "es": "Cena con maridaje",
    "en": "Dinner with pairing"
  },
  "dinnerTitle": {
    "es": "La cena",
    "en": "The dinner"
  },
  "dinnerBody": {
    "es": "Menú de temporada desde el huerto de Olivea, con maridaje del huerto incluido.",
    "en": "A seasonal menu from the Olivea garden, with the garden pairing included."
  },
  "perPerson": {
    "es": "MXN por persona",
    "en": "MXN per person"
  },
  "dinnerCta": {
    "es": "Reservar cena",
    "en": "Book the dinner"
  },
  "dinnerVia": {
    "es": "Vía OpenTable",
    "en": "Via OpenTable"
  },
  "stayKicker": {
    "es": "Estancia completa",
    "en": "The full stay"
  },
  "stayTitle": {
    "es": "Cena + 2 noches en Casa Olivea",
    "en": "Dinner + 2 nights at Casa Olivea"
  },
  "stayBody": {
    "es": "Para 2 personas: dos noches de hospedaje en Casa Olivea y la cena con maridaje del 1 de noviembre. Precio especial válido únicamente con esta cena de Mesa Invitada. Se reserva directamente con recepción.",
    "en": "For 2 guests: two nights at Casa Olivea and the November 1 dinner with pairing. Special rate valid only with this Mesa Invitada dinner. Booked directly with reception."
  },
  "plusTax": {
    "es": "MXN para 2 personas · impuestos incluidos",
    "en": "MXN for 2 guests · taxes included"
  },
  "stayCta": {
    "es": "Reservar estancia",
    "en": "Book the stay"
  },
  "stayVia": {
    "es": "Vía WhatsApp con recepción",
    "en": "Via WhatsApp with reception"
  },
  "stayMessage": {
    "es": "Hola, me interesa la Estancia Completa de Mesa Invitada Vol. 03 con el chef Fernando Hernández (1 de noviembre): 2 noches en Casa Olivea + la cena con maridaje, para 2 personas.",
    "en": "Hi, I'm interested in the Mesa Invitada Vol. 03 full stay with chef Fernando Hernández (November 1): 2 nights at Casa Olivea + the dinner with pairing, for 2 guests."
  },
  "limited": {
    "es": "Cupo limitado",
    "en": "Limited seating"
  },
  "share": {
    "es": "Compartir",
    "en": "Share"
  },
  "copied": {
    "es": "Enlace copiado",
    "en": "Link copied"
  },
  "shareText": {
    "es": "Mesa Invitada Vol. 03 en Olivea: cena de Día de Muertos con el chef Fernando Hernández.",
    "en": "Mesa Invitada Vol. 03 at Olivea: a Día de Muertos dinner with chef Fernando Hernández."
  },
  "posterAlt": {
    "es": "Cartel de Mesa Invitada Volumen 03: el chef Fernando Hernández, de Moyuelo, sentado en un sillón; cena de Día de Muertos el domingo 1 de noviembre en Olivea Farm To Table.",
    "en": "Mesa Invitada Volume 03 poster: chef Fernando Hernández of Moyuelo seated on a sofa; a Día de Muertos dinner on Sunday, November 1 at Olivea Farm To Table."
  },
  "pastNote": {
    "es": "Esta cena fue el domingo 1 de noviembre. Gracias a quienes nos acompañaron; pronto anunciaremos la próxima Mesa Invitada.",
    "en": "This dinner took place on Sunday, November 1. Thank you to everyone who joined us; the next Mesa Invitada will be announced soon."
  }
}$j$::jsonb)
on conflict (id) do nothing;

commit;
