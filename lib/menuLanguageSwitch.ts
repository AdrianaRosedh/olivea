// lib/menuLanguageSwitch.ts
// Keeps the phone menu open across a language switch made from inside it.
//
// The menu lives under the [lang] segment, so going from /es/… to /en/…
// mounts it fresh and its open state is lost: the switch looked like a full
// reload. The menu leaves a short-lived note before switching; the fresh menu
// reads it and starts open, now in the other language.

const KEY = "olivea:menu-keep-open";
const TTL_MS = 5000;

export function markMenuKeepOpen() {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Private mode / storage off: the menu simply closes, as before.
  }
}

/** True when a switch from the menu happened in the last few seconds. */
export function peekMenuKeepOpen(): boolean {
  try {
    const at = Number(sessionStorage.getItem(KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < TTL_MS;
  } catch {
    return false;
  }
}

/** Clears the note: the guest closed the menu, or it has reappeared. It is
 *  not cleared on read, because the layout can mount the phone navbar more
 *  than once while it settles, and the first, short-lived mount would use it
 *  up before the real one. */
export function clearMenuKeepOpen() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
