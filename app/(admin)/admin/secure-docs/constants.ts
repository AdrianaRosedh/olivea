// Plain constants for the secure-docs console. Kept OUT of actions.ts because
// a "use server" module may only export async functions, not values.

/** The printed QR encodes <base>/d/<token>. /d/* is served on the private domain. */
export const SECURE_DOC_BASE_URL = "https://olivea.ai";
