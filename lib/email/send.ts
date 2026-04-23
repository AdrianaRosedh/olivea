// lib/email/send.ts
// ─────────────────────────────────────────────────────────────────────
// High-level email sending functions using Resend.
// Each function combines a template with sending logic.
// ─────────────────────────────────────────────────────────────────────

import { resend, FROM_DEFAULT, FROM_CAREERS } from "./client";
import {
  magicLinkEmail,
  inviteEmail,
  careersApplicationEmail,
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
}) {
  const html = careersApplicationEmail(opts.applicant);

  const { error } = await resend.emails.send({
    from: FROM_CAREERS,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: `Nueva aplicación — ${opts.applicant.name} (${opts.applicant.area})`,
    html,
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
