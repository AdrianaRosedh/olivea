// lib/email/template.ts
// ─────────────────────────────────────────────────────────────────────
// Branded Olivea email templates — inline HTML for maximum
// compatibility across email clients.
//
// Design language: warm, earthy, minimal — matching Olivea's identity.
// Colors: #5e7658 (olive green), #2d3b29 (dark ink), #f4f5f0 (warm bg),
//         #c9a96e (warm gold accent), #6b7a65 (clay text)
// ─────────────────────────────────────────────────────────────────────

import { SITE_URL } from "./client";

/* ── Shared Layout ── */

function layout(opts: {
  preheader?: string;
  body: string;
  footer?: string;
}) {
  const { preheader, body, footer } = opts;

  return `<!DOCTYPE html>
<html lang="es" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Olivea</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: #5e7658; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1f18 !important; }
      .email-card { background-color: #252b22 !important; }
      .email-text { color: #e8eae4 !important; }
      .email-muted { color: #9ca896 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f0; -webkit-text-size-adjust: none; text-size-adjust: none;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f4f5f0;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}

  <!-- Outer wrapper -->
  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f5f0;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 8px;" align="center">
                    <!-- Olive branch icon as text fallback -->
                    <div style="width: 48px; height: 48px; margin: 0 auto 8px;">
                      <img
                        src="${SITE_URL}/brand/OliveaFTTIcon.svg"
                        alt="Olivea"
                        width="48"
                        height="48"
                        style="display: block; width: 48px; height: 48px;"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-size: 18px; font-weight: 600; color: #2d3b29; letter-spacing: 0.5px;">OLIVEA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td>
              <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(94,118,88,0.06);">
                <tr>
                  <td style="padding: 40px 32px;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              ${footer ?? defaultFooter()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function defaultFooter() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom: 12px;">
          <span style="display: inline-block; width: 40px; height: 1px; background-color: #c9a96e;"></span>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size: 11px; color: #6b7a65; line-height: 18px;">
          <a href="${SITE_URL}" style="color: #5e7658; font-weight: 500;">oliveafarmtotable.com</a>
          <br />
          Valle de Guadalupe, Ensenada, B.C., México
          <br />
          <span style="color: #c9a96e;">·</span> Farm to Table <span style="color: #c9a96e;">·</span> Hotel <span style="color: #c9a96e;">·</span> Café <span style="color: #c9a96e;">·</span>
        </td>
      </tr>
    </table>`;
}

/* ── Reusable elements ── */

function primaryButton(label: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 12px; background-color: #5e7658;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
            href="${href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="25%" fillcolor="#5e7658">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">${label}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${href}"
             target="_blank"
             style="
               display: inline-block;
               padding: 14px 40px;
               font-size: 14px;
               font-weight: 600;
               color: #ffffff;
               background-color: #5e7658;
               border-radius: 12px;
               text-decoration: none;
               text-align: center;
               min-width: 180px;
               line-height: 1;
             "
          >${label}</a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

function divider() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
    <tr>
      <td style="height: 1px; background: linear-gradient(to right, transparent, #c9a96e40, transparent);"></td>
    </tr>
  </table>`;
}

/* ══════════════════════════════════════════════════════════════════════
   EMAIL TEMPLATES
   ══════════════════════════════════════════════════════════════════════ */

/** Magic link sign-in email */
export function magicLinkEmail(opts: { magicLinkUrl: string; email: string }) {
  const body = `
    <h1 class="email-text" style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #2d3b29; text-align: center;">
      Sign in to Olivea
    </h1>
    <p class="email-muted" style="margin: 0 0 24px; font-size: 14px; color: #6b7a65; text-align: center; line-height: 22px;">
      Click the button below to access your admin portal.
      <br />This link expires in 1 hour.
    </p>

    ${primaryButton("Sign in to Olivea", opts.magicLinkUrl)}

    ${divider()}

    <p class="email-muted" style="margin: 0; font-size: 12px; color: #6b7a65; text-align: center; line-height: 18px;">
      This link was requested for <strong style="color: #2d3b29;">${escapeHtml(opts.email)}</strong>.
      <br />If you didn't request this, you can safely ignore this email.
    </p>

    <p class="email-muted" style="margin: 16px 0 0; font-size: 11px; color: #9ca896; text-align: center; line-height: 16px; word-break: break-all;">
      Or copy this link:<br />
      <a href="${opts.magicLinkUrl}" style="color: #5e7658; font-size: 11px;">${opts.magicLinkUrl}</a>
    </p>`;

  return layout({
    preheader: "Your Olivea admin sign-in link",
    body,
  });
}

/** Team invitation email */
export function inviteEmail(opts: {
  inviteName: string;
  invitedByName: string;
  role: string;
  magicLinkUrl: string;
}) {
  const body = `
    <h1 class="email-text" style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #2d3b29; text-align: center;">
      Welcome to Olivea
    </h1>
    <p class="email-muted" style="margin: 0 0 24px; font-size: 14px; color: #6b7a65; text-align: center; line-height: 22px;">
      ${escapeHtml(opts.invitedByName)} invited you to join the Olivea team
      <br />as <strong style="color: #2d3b29;">${escapeHtml(opts.role)}</strong>.
    </p>

    ${primaryButton("Accept invitation", opts.magicLinkUrl)}

    ${divider()}

    <p class="email-muted" style="margin: 0; font-size: 12px; color: #6b7a65; text-align: center; line-height: 18px;">
      This invitation expires in 24 hours.
      <br />If you weren't expecting this, you can safely ignore it.
    </p>`;

  return layout({
    preheader: `${opts.invitedByName} invited you to join Olivea`,
    body,
  });
}

/** Careers application received (sent to team) */
export function careersApplicationEmail(opts: {
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
}) {
  const field = (label: string, value: string) =>
    `<tr>
      <td style="padding: 6px 0; font-size: 12px; color: #6b7a65; width: 120px; vertical-align: top;">${label}</td>
      <td class="email-text" style="padding: 6px 0; font-size: 14px; color: #2d3b29; vertical-align: top;">${escapeHtml(value)}</td>
    </tr>`;

  const answer = (question: string, answer: string) =>
    `<div style="margin-bottom: 20px;">
      <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #5e7658; text-transform: uppercase; letter-spacing: 0.5px;">${question}</p>
      <p class="email-text" style="margin: 0; font-size: 14px; color: #2d3b29; line-height: 22px;">${escapeHtml(answer).replace(/\n/g, "<br/>")}</p>
    </div>`;

  const body = `
    <h1 class="email-text" style="margin: 0 0 4px; font-size: 20px; font-weight: 600; color: #2d3b29;">
      Nueva aplicación
    </h1>
    <p class="email-muted" style="margin: 0 0 24px; font-size: 14px; color: #6b7a65;">
      ${escapeHtml(opts.name)} — ${escapeHtml(opts.area)}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${field("Nombre", opts.name)}
      ${field("Email", opts.email)}
      ${field("Teléfono", opts.phone)}
      ${field("Área", opts.area)}
      ${field("Disponibilidad", opts.availability)}
      ${field("Idiomas", opts.languages)}
      ${opts.role ? field("Rol", opts.role) : ""}
      ${opts.links ? field("Links", opts.links) : ""}
    </table>

    ${divider()}

    ${answer("1. Excelencia", opts.q1)}
    ${answer("2. Feedback difícil", opts.q2)}
    ${answer("3. ¿Por qué Olivea?", opts.q3)}

    ${opts.notes ? `${divider()}${answer("Notas adicionales", opts.notes)}` : ""}

    <p style="margin: 24px 0 0; font-size: 11px; color: #9ca896; text-align: right;">
      IP: ${escapeHtml(opts.ip)} · ${new Date().toISOString().split("T")[0]}
    </p>`;

  return layout({
    preheader: `Nueva aplicación de ${opts.name} para ${opts.area}`,
    body,
    footer: `
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="font-size: 11px; color: #6b7a65; line-height: 18px;">
            Email enviado automáticamente desde el formulario de carreras de Olivea.
          </td>
        </tr>
      </table>`,
  });
}

/** Password reset email */
export function passwordResetEmail(opts: { resetUrl: string; email: string }) {
  const body = `
    <h1 class="email-text" style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #2d3b29; text-align: center;">
      Reset your password
    </h1>
    <p class="email-muted" style="margin: 0 0 24px; font-size: 14px; color: #6b7a65; text-align: center; line-height: 22px;">
      We received a request to reset the password for your Olivea admin account.
    </p>

    ${primaryButton("Reset password", opts.resetUrl)}

    ${divider()}

    <p class="email-muted" style="margin: 0; font-size: 12px; color: #6b7a65; text-align: center; line-height: 18px;">
      This link expires in 1 hour and can only be used once.
      <br />If you didn't request a password reset, you can safely ignore this email.
    </p>`;

  return layout({
    preheader: "Reset your Olivea admin password",
    body,
  });
}

/* ── Utility ── */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c
  );
}
