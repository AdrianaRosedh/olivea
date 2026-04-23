// lib/email/client.ts
// ─────────────────────────────────────────────────────────────────────
// Resend client — single instance shared across the app.
// ─────────────────────────────────────────────────────────────────────

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY && process.env.NODE_ENV === "production") {
  console.warn("[email] RESEND_API_KEY is not set — emails will not be sent.");
}

export const resend = new Resend(RESEND_API_KEY ?? "re_placeholder");

/**
 * Default sender for all Olivea emails.
 * Must match a verified domain in Resend.
 */
/**
 * Default "from" address.
 * Set RESEND_FROM_EMAIL once casaolivea.com is verified on Resend.
 * Until then, falls back to Resend's shared test domain.
 */
export const FROM_DEFAULT =
  process.env.RESEND_FROM_EMAIL ?? "Olivea <no-reply@roseiies.com>";
export const FROM_CAREERS =
  process.env.RESEND_CAREERS_FROM ?? "Olivea Carreras <rrhh@roseiies.com>";

/** Site URL for links in emails */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oliveafarmtotable.com";
