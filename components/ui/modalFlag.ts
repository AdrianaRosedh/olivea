// components/ui/modalFlag.ts
// ─────────────────────────────────────────────────────────────────────
// "Is a modal open?" — one small global flag.
//
// It was written for scrollLock's panic-unlock, which needs to tell a
// deliberate scroll lock from a stuck one. scrollLock reads the data attribute
// on <html> directly, so that attribute stays the source of truth and is set
// exactly as before.
//
// What's new is that components can now subscribe. Nothing could before — the
// flag was only ever written — which is why the Live Garden orb (z-9999, above
// every modal on the site) floated over open dialogs instead of getting out of
// the way.
// ─────────────────────────────────────────────────────────────────────

type Listener = () => void;

const listeners = new Set<Listener>();
let modalOpen = false;

export function setModalOpen(isOpen: boolean) {
  if (typeof document === "undefined") return;

  const el = document.documentElement;
  if (isOpen) el.dataset.modalOpen = "1";
  else delete el.dataset.modalOpen;

  // Bail before notifying if nothing actually changed. useScrollLock re-asserts
  // the flag on every visibilitychange/focus while a modal is open, so repeated
  // `true` is normal and must not churn subscribers.
  if (isOpen === modalOpen) return;
  modalOpen = isOpen;
  for (const listener of listeners) listener();
}

/** Subscribe to open/close. Returns the unsubscribe function. */
export function subscribeModalOpen(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Client snapshot, for useSyncExternalStore. */
export function getModalOpen(): boolean {
  return modalOpen;
}

/**
 * Server snapshot. Always false — there are no modals during SSR, and this
 * has to match the client's first render or hydration breaks.
 */
export function getModalOpenServer(): boolean {
  return false;
}
