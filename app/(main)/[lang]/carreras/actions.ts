"use server";

import { z } from "zod";
import nodemailer from "nodemailer";
import { headers } from "next/headers";

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(7, "Teléfono requerido"),
  area: z.string().min(2, "Selecciona un área"),
  availability: z.string().min(2, "Selecciona disponibilidad"),
  languages: z.string().min(2, "Indica idiomas"),
  role: z.string().optional(),
  links: z.string().optional(),
  q1: z.string().min(10, "Respuesta muy corta"),
  q2: z.string().min(10, "Respuesta muy corta"),
  q3: z.string().min(6, "Respuesta muy corta"),
  notes: z.string().optional(),

  // anti-spam
  website: z.string().optional(), // honeypot
  startedAt: z.string().optional(), // ms timestamp
  turnstileToken: z.string().min(10, "Verificación requerida"),
});

export type ApplicationErrors = Record<string, string>;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

async function getClientIp() {
  // ✅ In your Next version, headers() is async (Promise<ReadonlyHeaders>)
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  return xff ? xff.split(",")[0]?.trim() : "unknown";
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false as const };

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip !== "unknown") body.set("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as { success: boolean };
  return { ok: data.success as boolean };
}

function smtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = String(process.env.SMTP_SECURE || "true") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) throw new Error("Missing SMTP env vars");

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function handleSubmit(
  formData: FormData
): Promise<{ errors?: ApplicationErrors; success?: true }> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: ApplicationErrors = {};
    parsed.error.errors.forEach((err) => {
      const key = err.path[0]?.toString();
      if (key) errors[key] = err.message;
    });
    return { errors };
  }

  const data = parsed.data;

  // 1) honeypot
  if (data.website && data.website.trim().length > 0) {
    return { errors: { form: "Solicitud inválida." } };
  }

  // 2) timing check (bots submit instantly)
  const started = Number(data.startedAt || "0");
  if (!Number.isFinite(started) || started <= 0) return { errors: { form: "Solicitud inválida." } };
  if (Date.now() - started < 2500) return { errors: { form: "Solicitud inválida." } };

  // 3) Turnstile verify
  const ip = await getClientIp();
  const ok = await verifyTurnstile(data.turnstileToken, ip);
  if (!ok.ok) return { errors: { turnstileToken: "No se pudo verificar. Intenta de nuevo." } };

  // 4) Send email via SMTP
  const to = process.env.CAREERS_TO_EMAIL || "rrhh@casaolivea.com";
  const from = process.env.CAREERS_FROM_EMAIL || process.env.SMTP_USER || "rrhh@casaolivea.com";

  const subject = `Nueva aplicación — ${data.name} (${data.area})`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;">
      <h2>Nueva aplicación (Olivea Carreras)</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Tel:</strong> ${escapeHtml(data.phone)}</p>
      <p><strong>Área:</strong> ${escapeHtml(data.area)}</p>
      <p><strong>Disponibilidad:</strong> ${escapeHtml(data.availability)}</p>
      <p><strong>Idiomas:</strong> ${escapeHtml(data.languages)}</p>
      <p><strong>Rol:</strong> ${escapeHtml(data.role || "-")}</p>
      <p><strong>Links:</strong> ${escapeHtml(data.links || "-")}</p>
      <hr/>
      <p><strong>1) Excelencia:</strong><br/>${escapeHtml(data.q1).replace(/\n/g, "<br/>")}</p>
      <p><strong>2) Feedback difícil:</strong><br/>${escapeHtml(data.q2).replace(/\n/g, "<br/>")}</p>
      <p><strong>3) ¿Por qué Olivea?:</strong><br/>${escapeHtml(data.q3).replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><strong>Notas:</strong><br/>${escapeHtml(data.notes || "-").replace(/\n/g, "<br/>")}</p>
      <p style="color:#666;font-size:12px">IP: ${escapeHtml(ip)} • ${new Date().toISOString()}</p>
    </div>
  `;

  try {
    const transporter = smtpTransport();
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      replyTo: data.email,
    });
  } catch (_e) {
    return { errors: { form: "No se pudo enviar. Intenta más tarde." } };
  }

  return { success: true };
}