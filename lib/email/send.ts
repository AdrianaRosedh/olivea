// lib/email/send.ts
// ─────────────────────────────────────────────────────────────────────
// High-level email sending functions using Resend.
// Each function combines a template with sending logic.
// ─────────────────────────────────────────────────────────────────────

import { resend, FROM_DEFAULT, FROM_CAREERS } from "./client";
import { areaLabel } from "@/lib/careers/areas";
import {
  magicLinkEmail,
  inviteEmail,
  careersApplicationEmail,
  applicationReceivedEmail,
  passwordResetEmail,
} from "./template";

/** Send a magic link sign-in email */
export async function sendMagicLinkEmail(opts: {
  to: string;
  magicLinkUrl: string;
}) {
  const html = magicLinkEmail({
    magicLinkUrl: opts.magicLinkUrl,
    email: opts.to,
  });

  const { error } = await resend.emails.send({
    from: FROM_DEFAULT,
    to: opts.to,
    subject: "Sign in to Olivea Admin",
    html,
  });

  if (error) {
    console.error("[email] Failed to send magic link:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/** Send a team invitation email */
export async function sendInviteEmail(opts: {
  to: string;
  inviteName: string;
  invitedByName: string;
  role: string;
  magicLinkUrl: string;
}) {
  const html = inviteEmail({
    inviteName: opts.inviteName,
    invitedByName: opts.invitedByName,
    role: opts.role,
    magicLinkUrl: opts.magicLinkUrl,
  });

  const { error } = await resend.emails.send({
    from: FROM_DEFAULT,
    to: opts.to,
    subject: `You're invited to join Olivea`,
    html,
  });

  if (error) {
    console.error("[email] Failed to send invite:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/** Send a careers application notification to the team */
export async function sendCareersEmail(opts: {
  to: string;
  replyTo: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    area: string;
    availability: string;
    languages: string;
    role?: string;
    links?: string;
    q1: string;
    q2: string;
    q3: string;
    notes?: string;
    ip: string;
  };
  /** Set only when the application came from a published posting. */
  openingTitle?: string;
  /** The locale the applicant used; the whole email follows it. */
  lang?: "es" | "en";
  /** The applicant's CV, when they attached one. */
  cv?: { filename: string; bytes: Uint8Array; kind: "pdf" | "docx" };
}) {
  const lang = opts.lang ?? "es";
  const html = careersApplicationEmail({ ...opts.applicant, lang });

  // Name the posting in the subject when there is one. This is the first
  // thing HR sees, and "(Marketing)" does not tell them which role was
  // advertised when several are live at once. Localised with the rest.
  const lead = lang === "es" ? "Nueva aplicación" : "New application";
  const subject = opts.openingTitle
    ? `${lead} — ${opts.applicant.name} · ${opts.openingTitle}`
    : `${lead} — ${opts.applicant.name} (${areaLabel(opts.applicant.area, lang) || opts.applicant.area})`;

  const { error } = await resend.emails.send({
    from: FROM_CAREERS,
    to: opts.to,
    replyTo: opts.replyTo,
    subject,
    html,
    // The CV rides along with the notification, so HR can read it without
    // signing into the admin. It is also stored, but this is the copy that
    // reaches them first.
    ...(opts.cv
      ? {
          attachments: [
            {
              filename: opts.cv.filename,
              content: Buffer.from(opts.cv.bytes),
            },
          ],
        }
      : {}),
  });

  if (error) {
    console.error("[email] Failed to send careers email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/** Send a password reset email */
export async function sendPasswordResetEmail(opts: {
  to: string;
  resetUrl: string;
}) {
  const html = passwordResetEmail({
    resetUrl: opts.resetUrl,
    email: opts.to,
  });

  const { error } = await resend.emails.send({
    from: FROM_DEFAULT,
    to: opts.to,
    subject: "Reset your Olivea password",
    html,
  });

  if (error) {
    console.error("[email] Failed to send password reset:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Confirmation to the applicant.
 *
 * Never throws. HR's notification is the delivery that matters; if this one
 * fails the application has still been received, and telling the applicant
 * their submission failed would be a lie. Logged instead.
 */
export async function sendApplicationReceivedEmail(opts: {
  to: string;
  name: string;
  lang: "es" | "en";
  openingTitle?: string;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_CAREERS,
      to: opts.to,
      subject:
        opts.lang === "es"
          ? "Recibimos tu solicitud — Olivea"
          : "We received your application — Olivea",
      html: applicationReceivedEmail({
        name: opts.name,
        lang: opts.lang,
        openingTitle: opts.openingTitle,
      }),
    });
    if (error) console.error("[email] applicant confirmation failed:", error);
  } catch (e) {
    console.error("[email] applicant confirmation threw:", e);
  }
}
