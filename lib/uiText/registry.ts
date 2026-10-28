// lib/uiText/registry.ts
//
// Every short piece of interface text the site shows — house names, the
// reservation window, the chat buttons, the cookie banner — under one stable
// key, with the label the admin shows for it.
//
// The wording itself is edited in /admin → Interface text and stored in
// public.ui_text. What is written here is the fallback copy (the same role as
// the snapshots in lib/content/data): what shows if a key was never saved or
// Supabase is unreachable. Adding a string to the site means adding its key
// here; the admin page lists it automatically.

export type UiTextEntry = {
  group: UiTextGroup;
  /** What the admin shows next to the field. */
  label: { es: string; en: string };
  es: string;
  en: string;
  /** One value for both languages (names, handles, links). */
  plain?: boolean;
};

export type UiTextGroup = "houses" | "reservation" | "opentable" | "chat" | "cookies" | "social";

export const UI_TEXT_GROUPS: Record<UiTextGroup, { es: string; en: string }> = {
  houses: { es: "Casas", en: "Houses" },
  reservation: { es: "Ventana de reservación", en: "Reservation window" },
  opentable: { es: "OpenTable dentro de la ventana", en: "OpenTable inside the window" },
  chat: { es: "Chat", en: "Chat" },
  cookies: { es: "Aviso de cookies", en: "Cookie notice" },
  social: { es: "Redes de cada casa", en: "Each house's socials" },
};

const e = (group: UiTextGroup, label: UiTextEntry["label"], es: string, en: string): UiTextEntry => ({ group, label, es, en });
const p = (group: UiTextGroup, label: UiTextEntry["label"], value: string): UiTextEntry => ({ group, label, es: value, en: value, plain: true });

export const UI_TEXT = {
  // ── Houses: the names a guest meets on the home cards, the reservation
  //    tabs and chooser. Emblems and photos stay with the design.
  "houses.restaurant.name": p("houses", { es: "Farm To Table — nombre", en: "Farm To Table — name" }, "Olivea Farm To Table"),
  "houses.restaurant.tab": p("houses", { es: "Farm To Table — nombre corto (pestañas)", en: "Farm To Table — short name (tabs)" }, "Farm To Table"),
  "houses.restaurant.descriptor": e("houses", { es: "Farm To Table — qué es", en: "Farm To Table — what it is" }, "Restaurante de alta cocina", "Fine Dining Restaurant"),
  "houses.restaurant.cue": e("houses", { es: "Farm To Table — acción (selector en teléfono)", en: "Farm To Table — action line (phone chooser)" }, "Reservar mesa", "Book a table"),
  "houses.hotel.name": p("houses", { es: "Casa Olivea — nombre", en: "Casa Olivea — name" }, "Casa Olivea"),
  "houses.hotel.tab": p("houses", { es: "Casa Olivea — nombre corto (pestañas)", en: "Casa Olivea — short name (tabs)" }, "Casa Olivea"),
  "houses.hotel.descriptor": e("houses", { es: "Casa Olivea — qué es", en: "Casa Olivea — what it is" }, "Hotel boutique", "Boutique Hotel"),
  "houses.hotel.cue": e("houses", { es: "Casa Olivea — acción (selector en teléfono)", en: "Casa Olivea — action line (phone chooser)" }, "Reservar estancia", "Book a stay"),
  "houses.cafe.name": p("houses", { es: "Café — nombre", en: "Café — name" }, "Olivea Café Wine Bar"),
  "houses.cafe.tab": p("houses", { es: "Café — nombre corto (pestañas)", en: "Café — short name (tabs)" }, "Café Wine Bar"),
  "houses.cafe.descriptor": e("houses", { es: "Café — qué es", en: "Café — what it is" }, "Café · brunch · vino", "Coffee · Brunch · Wine"),
  "houses.cafe.cue": e("houses", { es: "Café — acción (selector en teléfono)", en: "Café — action line (phone chooser)" }, "Sin reservación", "Walk-ins welcome"),

  // ── Each house's own Instagram account and Spotify playlist (the icons ask
  //    which house). Leave a playlist empty if the house has none.
  "social.restaurant.instagram": p("social", { es: "Farm To Table — cuenta de Instagram (sin @)", en: "Farm To Table — Instagram account (without @)" }, "oliveafarmtotable"),
  "social.hotel.instagram": p("social", { es: "Casa Olivea — cuenta de Instagram (sin @)", en: "Casa Olivea — Instagram account (without @)" }, "casaolivea"),
  "social.cafe.instagram": p("social", { es: "Café — cuenta de Instagram (sin @)", en: "Café — Instagram account (without @)" }, "oliveacafewine"),
  "social.restaurant.spotify": p("social", { es: "Farm To Table — enlace a la playlist de Spotify", en: "Farm To Table — Spotify playlist link" }, "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8"),
  "social.hotel.spotify": p("social", { es: "Casa Olivea — enlace a la playlist de Spotify", en: "Casa Olivea — Spotify playlist link" }, ""),
  "social.cafe.spotify": p("social", { es: "Café — enlace a la playlist de Spotify", en: "Café — Spotify playlist link" }, "https://open.spotify.com/playlist/2hSsQrXDw957snOBoeiwD7"),
  "social.instagram.title": e("social", { es: "Selector de Instagram — título", en: "Instagram chooser — title" }, "Síguenos en Instagram", "Follow us on Instagram"),
  "social.instagram.trigger": e("social", { es: "Ícono de Instagram — etiqueta", en: "Instagram icon — label" }, "Instagram: elige la casa", "Instagram: choose the house"),
  "social.spotify.title": e("social", { es: "Selector de Spotify — título", en: "Spotify chooser — title" }, "Escucha en Spotify", "Listen on Spotify"),
  "social.spotify.trigger": e("social", { es: "Ícono de Spotify — etiqueta", en: "Spotify icon — label" }, "Spotify: elige la playlist", "Spotify: choose the playlist"),
  "social.spotify.sub": e("social", { es: "Selector de Spotify — línea bajo cada casa", en: "Spotify chooser — line under each house" }, "Playlist", "Playlist"),

  // ── The reservation window.
  "reservation.title": e("reservation", { es: "Título de la ventana", en: "Window title" }, "Reservaciones", "Reservations"),
  "reservation.chooser": e("reservation", { es: "Selector de casa — pregunta", en: "House chooser — question" }, "¿Dónde te esperamos?", "Where shall we welcome you?"),
  "reservation.signature": p("reservation", { es: "Firma", en: "Signature line" }, "Valle de Guadalupe"),
  "reservation.close": e("reservation", { es: "Cerrar", en: "Close" }, "Cerrar", "Close"),
  "reservation.fullscreen": e("reservation", { es: "Pantalla completa", en: "Full screen" }, "Pantalla completa", "Full screen"),
  "reservation.exitFullscreen": e("reservation", { es: "Salir de pantalla completa", en: "Exit full screen" }, "Salir de pantalla completa", "Exit full screen"),
  "reservation.openFullscreen": e("reservation", { es: "Tarjeta en teléfono — botón", en: "Phone card — button" }, "Abrir en pantalla completa", "Open in full screen"),
  "reservation.hotel.sheetTitle": e("reservation", { es: "Casa Olivea — título de la ventana", en: "Casa Olivea — window title" }, "Casa Olivea — Reservaciones", "Casa Olivea — Reservations"),
  "reservation.hotel.kicker": e("reservation", { es: "Casa Olivea — etiqueta de la tarjeta en teléfono", en: "Casa Olivea — phone card label" }, "Reservación hotel", "Hotel reservation"),
  "reservation.hotel.cardTitle": e("reservation", { es: "Casa Olivea — título de la tarjeta en teléfono", en: "Casa Olivea — phone card title" }, "Reserva tu estancia en Casa Olivea", "Book your stay at Casa Olivea"),
  "reservation.hotel.tap": e("reservation", { es: "Casa Olivea — nota de la tarjeta en teléfono", en: "Casa Olivea — phone card note" }, "Toca para reservar en pantalla completa.", "Tap to book in full screen."),
  "reservation.hotel.engineTitle": e("reservation", { es: "Casa Olivea — nombre del motor de reservas (lectores de pantalla)", en: "Casa Olivea — booking engine name (screen readers)" }, "Reservas Casa Olivea", "Reservas Casa Olivea"),
  "reservation.restaurant.sheetTitle": e("reservation", { es: "Farm To Table — título de la ventana", en: "Farm To Table — window title" }, "Olivea Farm To Table — Reservaciones", "Olivea Farm To Table — Reservations"),
  "reservation.restaurant.paneTitle": p("reservation", { es: "Farm To Table — título del panel en teléfono", en: "Farm To Table — phone pane title" }, "Olivea Farm To Table — OpenTable"),
  "reservation.restaurant.kicker": e("reservation", { es: "Farm To Table — etiqueta de la tarjeta en teléfono", en: "Farm To Table — phone card label" }, "Reservación restaurante", "Restaurant reservation"),
  "reservation.restaurant.cardTitle": e("reservation", { es: "Farm To Table — título de la tarjeta en teléfono", en: "Farm To Table — phone card title" }, "Busca mesa en Olivea Farm To Table", "Find a table at Olivea Farm To Table"),
  "reservation.restaurant.tap": e("reservation", { es: "Farm To Table — nota de la tarjeta en teléfono", en: "Farm To Table — phone card note" }, "Toca para reservar en pantalla completa.", "Tap to reserve in full screen."),
  "reservation.restaurant.direct": e("reservation", { es: "Farm To Table — enlace directo a OpenTable", en: "Farm To Table — direct OpenTable link" }, "Reservar directamente en OpenTable", "Reserve directly on OpenTable"),
  "reservation.restaurant.openOnOpenTable": e("reservation", { es: "Farm To Table — botón de OpenTable (teléfono)", en: "Farm To Table — OpenTable button (phone)" }, "Abrir en OpenTable", "Open on OpenTable"),
  "reservation.cafe.noNeed": e("reservation", { es: "Café — línea principal", en: "Café — main line" }, "Por ahora no necesitas reservar.", "For now, there’s no need to reserve."),
  "reservation.cafe.welcome": e("reservation", { es: "Café — segunda línea", en: "Café — second line" }, "Ven cuando quieras; te esperamos.", "Come whenever you like; we’ll be waiting."),
  "reservation.cafe.hours": e("reservation", { es: "Café — etiqueta de horario", en: "Café — hours label" }, "Horario", "Hours"),
  "reservation.cafe.everyDay": e("reservation", { es: "Café — “todos los días”", en: "Café — “every day”" }, "Todos los días", "Every day"),
  "reservation.cafe.discover": e("reservation", { es: "Café — enlace a su página", en: "Café — link to its page" }, "Conoce el café", "Discover the café"),

  // ── OpenTable inside the window, and the card shown when a browser won't
  //    let it show.
  "opentable.loading": e("opentable", { es: "Cargando", en: "Loading" }, "Cargando reservaciones…", "Loading reservations…"),
  "opentable.frameTitle": e("opentable", { es: "Nombre del marco (lectores de pantalla)", en: "Frame name (screen readers)" }, "Reservar en Olivea Farm To Table en OpenTable", "Reserve at Olivea Farm To Table on OpenTable"),
  "opentable.card.title": e("opentable", { es: "Tarjeta — título", en: "Card — title" }, "Reserva en una ventana de OpenTable.", "Book in an OpenTable window."),
  "opentable.card.note": e("opentable", { es: "Tarjeta — nota", en: "Card — note" }, "Este navegador no deja que OpenTable se muestre dentro de nuestra página; en su propia ventana carga en un instante.", "This browser won’t let OpenTable show inside our page; in its own window it loads in a moment."),
  "opentable.card.cta": e("opentable", { es: "Tarjeta — botón", en: "Card — button" }, "Reservar en OpenTable", "Book on OpenTable"),
  "opentable.card.openedTitle": e("opentable", { es: "Tarjeta, ventana abierta — título", en: "Card, window open — title" }, "Tu reservación está abierta en la ventana de OpenTable.", "Your booking is open in the OpenTable window."),
  "opentable.card.openedNote": e("opentable", { es: "Tarjeta, ventana abierta — nota", en: "Card, window open — note" }, "Al terminar, ciérrala y sigues aquí.", "When you’re done, close it and you’re still here."),
  "opentable.card.openedCta": e("opentable", { es: "Tarjeta, ventana abierta — botón", en: "Card, window open — button" }, "Volver a abrir OpenTable", "Open OpenTable again"),
  "opentable.card.retry": e("opentable", { es: "Tarjeta — intentar de nuevo", en: "Card — try again" }, "Intentar aquí de nuevo", "Try here again"),

  // ── Chat buttons. Their hours are in /admin → Operating Hours (Chat).
  "chat.reserve": e("chat", { es: "Barra en teléfono — Reservar", en: "Phone dock — Reserve" }, "Reservar", "Reserve"),
  "chat.live": e("chat", { es: "Barra en teléfono — En vivo", en: "Phone dock — Live" }, "En Vivo", "Live"),
  "chat.chat": e("chat", { es: "Barra en teléfono — Chat", en: "Phone dock — Chat" }, "Chat", "Chat"),
  "chat.online": e("chat", { es: "Barra en teléfono — en línea", en: "Phone dock — online" }, "en línea", "online"),
  "chat.opensAt": e("chat", { es: "Barra en teléfono — cerrado ({time} = hora de apertura)", en: "Phone dock — closed ({time} = opening time)" }, "abre {time}", "opens {time}"),
  "chat.dockOpen": e("chat", { es: "Barra en teléfono — abrir (lectores de pantalla)", en: "Phone dock — open (screen readers)" }, "Mostrar acciones; arrastra para mover", "Show actions; drag to move"),
  "chat.dockClose": e("chat", { es: "Barra en teléfono — cerrar (lectores de pantalla)", en: "Phone dock — close (screen readers)" }, "Ocultar acciones", "Hide actions"),
  "chat.desktopAvailable": e("chat", { es: "Botón en computadora — disponible", en: "Desktop button — available" }, "Chat en Vivo — Disponible", "Live Chat — Available"),
  "chat.desktopClosed": e("chat", { es: "Botón en computadora — fuera de horario", en: "Desktop button — closed" }, "Chat — Fuera de Horario", "Chat — Out of Office Hours"),
  "chat.desktopOpen": e("chat", { es: "Botón en computadora — abrir (lectores de pantalla)", en: "Desktop button — open (screen readers)" }, "Abrir Chat", "Open Chat"),

  // ── Cookie notice.
  "cookies.label": e("cookies", { es: "Nombre del aviso (lectores de pantalla)", en: "Notice name (screen readers)" }, "Aviso de cookies", "Cookie notice"),
  "cookies.title": e("cookies", { es: "Título", en: "Title" }, "Cuidamos tu privacidad", "We value your privacy"),
  "cookies.body": e("cookies", { es: "Texto", en: "Text" }, "Usamos cookies para entender cómo se usa el sitio y mejorar tu experiencia. Tú decides — las esenciales siempre están activas.", "We use cookies to understand how the site is used and improve your experience. Your choice — essential ones are always on."),
  "cookies.accept": e("cookies", { es: "Aceptar", en: "Accept" }, "Aceptar", "Accept"),
  "cookies.essential": e("cookies", { es: "Solo esenciales", en: "Essential only" }, "Solo esenciales", "Essential only"),
  "cookies.policy": e("cookies", { es: "Enlace a la política", en: "Policy link" }, "Política de cookies", "Cookie policy"),
} as const satisfies Record<string, UiTextEntry>;

export type UiTextKey = keyof typeof UI_TEXT;
export type UiTextValues = Partial<Record<UiTextKey, { es: string; en: string }>>;

/** The text for a key in a language: the admin's wording, else the fallback. */
export function uiText(values: UiTextValues | undefined, key: UiTextKey, lang: "es" | "en"): string {
  const saved = values?.[key];
  if (saved && typeof saved[lang] === "string") return saved[lang];
  return UI_TEXT[key][lang];
}

/** Every key with its current wording, as stored in public.ui_text. */
export function uiTextSeed(): Record<UiTextKey, { es: string; en: string }> {
  return Object.fromEntries(
    Object.entries(UI_TEXT).map(([k, v]) => [k, { es: v.es, en: v.en }])
  ) as Record<UiTextKey, { es: string; en: string }>;
}
