-- 20261028h_ui_text.sql
--
-- Batch C, part 1: the site frame. The house names and what each one is, the
-- reservation window, OpenTable's fallback card, the chat buttons, the cookie
-- notice and each house's Instagram and Spotify were written in code
-- (lib/houses.ts and each component). They move to ui_text — one record, one
-- key per piece of text — edited in /admin → Interface text. The list of keys
-- and their fallback wording live in lib/uiText/registry.ts.
--
-- The chat buttons' hours were a fixed 8:00–21:30 in code; they become a
-- "Chat" entry in /admin → Operating Hours. Every other reader of the hours
-- list picks its venues by name, so the entry stays out of Google's data, the
-- Contact page and the AI summary.
--
-- Seeded word for word with the text live on 2026-10-28. Same rules as the
-- page records: one row, public read, writes only through the service role.

begin;

create table if not exists public.ui_text (
  id text primary key default 'singleton' check (id = 'singleton'),
  text jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ui_text enable row level security;

drop policy if exists "Public read ui_text" on public.ui_text;
create policy "Public read ui_text"
  on public.ui_text for select to public using (true);

drop policy if exists "Service role full ui_text" on public.ui_text;
create policy "Service role full ui_text"
  on public.ui_text for all to service_role using (true) with check (true);

revoke all on public.ui_text from anon, authenticated;
grant select on public.ui_text to anon, authenticated;

drop trigger if exists set_updated_at on public.ui_text;
create trigger set_updated_at before update on public.ui_text
  for each row execute function update_updated_at();

insert into public.ui_text (id, text) values ('singleton', $j${
  "houses.restaurant.name": {
    "es": "Olivea Farm To Table",
    "en": "Olivea Farm To Table"
  },
  "houses.restaurant.tab": {
    "es": "Farm To Table",
    "en": "Farm To Table"
  },
  "houses.restaurant.descriptor": {
    "es": "Restaurante de alta cocina",
    "en": "Fine Dining Restaurant"
  },
  "houses.restaurant.cue": {
    "es": "Reservar mesa",
    "en": "Book a table"
  },
  "houses.hotel.name": {
    "es": "Casa Olivea",
    "en": "Casa Olivea"
  },
  "houses.hotel.tab": {
    "es": "Casa Olivea",
    "en": "Casa Olivea"
  },
  "houses.hotel.descriptor": {
    "es": "Hotel boutique",
    "en": "Boutique Hotel"
  },
  "houses.hotel.cue": {
    "es": "Reservar estancia",
    "en": "Book a stay"
  },
  "houses.cafe.name": {
    "es": "Olivea Café Wine Bar",
    "en": "Olivea Café Wine Bar"
  },
  "houses.cafe.tab": {
    "es": "Café Wine Bar",
    "en": "Café Wine Bar"
  },
  "houses.cafe.descriptor": {
    "es": "Café · brunch · vino",
    "en": "Coffee · Brunch · Wine"
  },
  "houses.cafe.cue": {
    "es": "Sin reservación",
    "en": "Walk-ins welcome"
  },
  "social.restaurant.instagram": {
    "es": "oliveafarmtotable",
    "en": "oliveafarmtotable"
  },
  "social.hotel.instagram": {
    "es": "casaolivea",
    "en": "casaolivea"
  },
  "social.cafe.instagram": {
    "es": "oliveacafewine",
    "en": "oliveacafewine"
  },
  "social.restaurant.spotify": {
    "es": "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8",
    "en": "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8"
  },
  "social.hotel.spotify": {
    "es": "",
    "en": ""
  },
  "social.cafe.spotify": {
    "es": "https://open.spotify.com/playlist/2hSsQrXDw957snOBoeiwD7",
    "en": "https://open.spotify.com/playlist/2hSsQrXDw957snOBoeiwD7"
  },
  "social.instagram.title": {
    "es": "Síguenos en Instagram",
    "en": "Follow us on Instagram"
  },
  "social.instagram.trigger": {
    "es": "Instagram: elige la casa",
    "en": "Instagram: choose the house"
  },
  "social.spotify.title": {
    "es": "Escucha en Spotify",
    "en": "Listen on Spotify"
  },
  "social.spotify.trigger": {
    "es": "Spotify: elige la playlist",
    "en": "Spotify: choose the playlist"
  },
  "social.spotify.sub": {
    "es": "Playlist",
    "en": "Playlist"
  },
  "reservation.title": {
    "es": "Reservaciones",
    "en": "Reservations"
  },
  "reservation.chooser": {
    "es": "¿Dónde te esperamos?",
    "en": "Where shall we welcome you?"
  },
  "reservation.signature": {
    "es": "Valle de Guadalupe",
    "en": "Valle de Guadalupe"
  },
  "reservation.close": {
    "es": "Cerrar",
    "en": "Close"
  },
  "reservation.fullscreen": {
    "es": "Pantalla completa",
    "en": "Full screen"
  },
  "reservation.exitFullscreen": {
    "es": "Salir de pantalla completa",
    "en": "Exit full screen"
  },
  "reservation.openFullscreen": {
    "es": "Abrir en pantalla completa",
    "en": "Open in full screen"
  },
  "reservation.hotel.sheetTitle": {
    "es": "Casa Olivea — Reservaciones",
    "en": "Casa Olivea — Reservations"
  },
  "reservation.hotel.kicker": {
    "es": "Reservación hotel",
    "en": "Hotel reservation"
  },
  "reservation.hotel.cardTitle": {
    "es": "Reserva tu estancia en Casa Olivea",
    "en": "Book your stay at Casa Olivea"
  },
  "reservation.hotel.tap": {
    "es": "Toca para reservar en pantalla completa.",
    "en": "Tap to book in full screen."
  },
  "reservation.hotel.engineTitle": {
    "es": "Reservas Casa Olivea",
    "en": "Reservas Casa Olivea"
  },
  "reservation.restaurant.sheetTitle": {
    "es": "Olivea Farm To Table — Reservaciones",
    "en": "Olivea Farm To Table — Reservations"
  },
  "reservation.restaurant.paneTitle": {
    "es": "Olivea Farm To Table — OpenTable",
    "en": "Olivea Farm To Table — OpenTable"
  },
  "reservation.restaurant.kicker": {
    "es": "Reservación restaurante",
    "en": "Restaurant reservation"
  },
  "reservation.restaurant.cardTitle": {
    "es": "Busca mesa en Olivea Farm To Table",
    "en": "Find a table at Olivea Farm To Table"
  },
  "reservation.restaurant.tap": {
    "es": "Toca para reservar en pantalla completa.",
    "en": "Tap to reserve in full screen."
  },
  "reservation.restaurant.direct": {
    "es": "Reservar directamente en OpenTable",
    "en": "Reserve directly on OpenTable"
  },
  "reservation.restaurant.openOnOpenTable": {
    "es": "Abrir en OpenTable",
    "en": "Open on OpenTable"
  },
  "reservation.cafe.noNeed": {
    "es": "Por ahora no necesitas reservar.",
    "en": "For now, there’s no need to reserve."
  },
  "reservation.cafe.welcome": {
    "es": "Ven cuando quieras; te esperamos.",
    "en": "Come whenever you like; we’ll be waiting."
  },
  "reservation.cafe.hours": {
    "es": "Horario",
    "en": "Hours"
  },
  "reservation.cafe.everyDay": {
    "es": "Todos los días",
    "en": "Every day"
  },
  "reservation.cafe.discover": {
    "es": "Conoce el café",
    "en": "Discover the café"
  },
  "opentable.loading": {
    "es": "Cargando reservaciones…",
    "en": "Loading reservations…"
  },
  "opentable.frameTitle": {
    "es": "Reservar en Olivea Farm To Table en OpenTable",
    "en": "Reserve at Olivea Farm To Table on OpenTable"
  },
  "opentable.card.title": {
    "es": "Reserva en una ventana de OpenTable.",
    "en": "Book in an OpenTable window."
  },
  "opentable.card.note": {
    "es": "Este navegador no deja que OpenTable se muestre dentro de nuestra página; en su propia ventana carga en un instante.",
    "en": "This browser won’t let OpenTable show inside our page; in its own window it loads in a moment."
  },
  "opentable.card.cta": {
    "es": "Reservar en OpenTable",
    "en": "Book on OpenTable"
  },
  "opentable.card.openedTitle": {
    "es": "Tu reservación está abierta en la ventana de OpenTable.",
    "en": "Your booking is open in the OpenTable window."
  },
  "opentable.card.openedNote": {
    "es": "Al terminar, ciérrala y sigues aquí.",
    "en": "When you’re done, close it and you’re still here."
  },
  "opentable.card.openedCta": {
    "es": "Volver a abrir OpenTable",
    "en": "Open OpenTable again"
  },
  "opentable.card.retry": {
    "es": "Intentar aquí de nuevo",
    "en": "Try here again"
  },
  "chat.reserve": {
    "es": "Reservar",
    "en": "Reserve"
  },
  "chat.live": {
    "es": "En Vivo",
    "en": "Live"
  },
  "chat.chat": {
    "es": "Chat",
    "en": "Chat"
  },
  "chat.online": {
    "es": "en línea",
    "en": "online"
  },
  "chat.opensAt": {
    "es": "abre {time}",
    "en": "opens {time}"
  },
  "chat.dockOpen": {
    "es": "Mostrar acciones; arrastra para mover",
    "en": "Show actions; drag to move"
  },
  "chat.dockClose": {
    "es": "Ocultar acciones",
    "en": "Hide actions"
  },
  "chat.desktopAvailable": {
    "es": "Chat en Vivo — Disponible",
    "en": "Live Chat — Available"
  },
  "chat.desktopClosed": {
    "es": "Chat — Fuera de Horario",
    "en": "Chat — Out of Office Hours"
  },
  "chat.desktopOpen": {
    "es": "Abrir Chat",
    "en": "Open Chat"
  },
  "cookies.label": {
    "es": "Aviso de cookies",
    "en": "Cookie notice"
  },
  "cookies.title": {
    "es": "Cuidamos tu privacidad",
    "en": "We value your privacy"
  },
  "cookies.body": {
    "es": "Usamos cookies para entender cómo se usa el sitio y mejorar tu experiencia. Tú decides — las esenciales siempre están activas.",
    "en": "We use cookies to understand how the site is used and improve your experience. Your choice — essential ones are always on."
  },
  "cookies.accept": {
    "es": "Aceptar",
    "en": "Accept"
  },
  "cookies.essential": {
    "es": "Solo esenciales",
    "en": "Essential only"
  },
  "cookies.policy": {
    "es": "Política de cookies",
    "en": "Cookie policy"
  }
}$j$::jsonb)
on conflict (id) do nothing;

-- The chat buttons' hours, added once.
update public.global_settings
   set hours = coalesce(hours, '[]'::jsonb) || $j$[{"id": "h4", "venue": "chat", "label": {"es": "Chat", "en": "Chat"}, "schedule": {"es": "Todos los días 8:00–21:30", "en": "Daily 8:00 am – 9:30 pm"}, "slots": [{"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "08:00", "closes": "21:30"}], "sortOrder": 3}]$j$::jsonb
 where id = 'singleton'
   and not exists (select 1 from jsonb_array_elements(coalesce(hours, '[]'::jsonb)) h where h->>'venue' = 'chat');

commit;
