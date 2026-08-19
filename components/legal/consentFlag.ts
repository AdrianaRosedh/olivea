// components/legal/consentFlag.ts
// ─────────────────────────────────────────────────────────────────────
// "Has the visitor dealt with the cookie banner yet?"
//
// The banner and the "we're hiring" pill both live in the bottom-left corner,
// so a first-time visitor got both at once — the banner on top, with a sliver
// of pill sticking out beside it. The pill now waits for this to turn true.
//
// CookieConsent owns the value because it is the only thing that knows both
// halves: whether a choice is already stored, and whether the panel is open
// right now (the footer's Cookies link can reopen it long after the first
// visit). Everyone else subscribes.
//
// Deliberately separate from modalFlag: the banner is not a modal, it locks
// nothing, and routing it through that flag would also make the orb and the
// chat launcher disappear for it, which is not wanted.
// ─────────────────────────────────────────────────────────────────────

type Listener = () => void;

const listeners = new Set<Listener>();

// Starts false so nothing bottom-left renders before CookieConsent has had a
// chance to say whether it needs the corner. It publishes on mount either way.
let settled = false;

/** CookieConsent calls this. True = no pending consent decision. */
export function setConsentSettled(value: boolean) {
  if (value === settled) return;
  settled = value;
  for (const listener of listeners) listener();
}

/** Subscribe to changes. Returns the unsubscribe function. */
export function subscribeConsentSettled(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Client snapshot, for useSyncExternalStore. */
export function getConsentSettled(): boolean {
  return settled;
}

/**
 * Server snapshot. Always false, matching the initial client value — the
 * server cannot read the visitor's cookie, and a mismatch here would break
 * hydration on every public page.
 */
export function getConsentSettledServer(): boolean {
  return false;
}
