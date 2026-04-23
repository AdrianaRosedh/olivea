"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { sendCareersEmail } from "@/lib/email/send";
import { submitApplication } from "@/lib/supabase/careers-actions";

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

export async function handleSubmit(
  formData: FormData
): Promise<{ errors?: ApplicationErrors; success?: true }> {
  // Rate limiting: 10 submissions per minute per IP
  const ip = await getClientIp();
  const rl = rateLimit(`carreras:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return { errors: { form: "Demasiadas solicitudes. Intenta en un momento." } };
  }

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
  const ok = await verifyTurnstile(data.turnstileToken, ip);
  if (!ok.ok) return { errors: { turnstileToken: "No se pudo verificar. Intenta de nuevo." } };

  // 4) Save application to Supabase
  const coverNote = [
    data.q1 ? `Q1: ${data.q1}` : "",
    data.q2 ? `Q2: ${data.q2}` : "",
    data.q3 ? `Q3: ${data.q3}` : "",
    data.notes ? `Notes: ${data.notes}` : "",
    data.role ? `Role: ${data.role}` : "",
    data.links ? `Links: ${data.links}` : "",
    data.languages ? `Languages: ${data.languages}` : "",
    data.availability ? `Availability: ${data.availability}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    await submitApplication({
      name: data.name,
      email: data.email,
      phone: data.phone,
      area: data.area,
      coverNote,
    });
  } catch {
    // Non-critical — the email is the primary delivery
  }

  // 5) Send branded email via Resend
  const to = process.env.CAREERS_TO_EMAIL || "rrhh@casaolivea.com";

  try {
    await sendCareersEmail({
      to,
      replyTo: data.email,
      applicant: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        area: data.area,
        availability: data.availability,
        languages: data.languages,
        role: data.role || undefined,
        links: data.links || undefined,
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        notes: data.notes || undefined,
        ip,
      },
    });
  } catch {
    return { errors: { form: "No se pudo enviar. Intenta más tarde." } };
  }

  return { success: true };
}