"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { rateLimitDistributed } from "@/lib/rate-limit";
import { sendCareersEmail, sendApplicationReceivedEmail } from "@/lib/email/send";
import { submitApplication } from "@/lib/supabase/careers-actions";
import { canonicalUrl } from "@/lib/site";
import {
  uploadResume,
  sniffResumeType,
  RESUME_MAX_BYTES,
} from "@/lib/supabase/resume-storage";

/* Messages in the applicant's language. These were Spanish only, so an English
   applicant was told "Nombre requerido". */
function messages(lang: "es" | "en") {
  const es = lang === "es";
  return {
    name: es ? "Nombre requerido" : "Name required",
    email: es ? "Correo inválido" : "Invalid email",
    phone: es ? "Teléfono requerido" : "Phone required",
    area: es ? "Selecciona un área" : "Choose a track",
    availability: es ? "Selecciona disponibilidad" : "Choose your availability",
    languages: es ? "Indica idiomas" : "List your languages",
    short: es ? "Respuesta muy corta" : "Answer too short",
    long: es ? "Texto demasiado largo" : "Text too long",
    verify: es ? "Verificación requerida" : "Verification required",
    tooMany: es ? "Demasiadas solicitudes. Intenta en un momento." : "Too many requests. Please try again in a moment.",
    invalid: es ? "Solicitud inválida." : "Invalid request.",
    verifyFailed: es ? "No se pudo verificar. Intenta de nuevo." : "Verification failed. Please try again.",
    cvTooBig: es ? "El archivo supera 4 MB." : "The file is larger than 4 MB.",
    cvType: es ? "Formato no válido. Adjunta un PDF o DOCX." : "Invalid format. Attach a PDF or DOCX.",
    sendFailed: es ? "No se pudo enviar. Intenta más tarde." : "Could not send. Please try again later.",
  };
}

/* Upper bounds are generous for real answers and stop a pasted megabyte from
   being stored and emailed. */
function formSchema(lang: "es" | "en") {
  const m = messages(lang);
  const text = (min: number, minMsg: string, max: number) =>
    z.string().trim().min(min, minMsg).max(max, m.long);
  const optional = (max: number) => z.string().trim().max(max, m.long).optional();
  return z.object({
    name: text(2, m.name, 120),
    email: z.string().trim().max(254, m.long).email(m.email),
    phone: text(7, m.phone, 40),
    area: text(2, m.area, 120),
    availability: text(2, m.availability, 120),
    languages: text(2, m.languages, 200),
    role: optional(200),
    links: optional(1000),
    // Set when the applicant came from a specific posting. Empty for the open
    // application, so it is validated as a UUID only when actually present.
    openingId: z.union([z.string().uuid(), z.literal("")]).optional(),
    // The posting's own title, carried separately from the editable "role"
    // field so the email subject and the cover note quote what was actually
    // advertised rather than whatever the applicant typed over it.
    openingTitle: z.string().max(200).optional(),
    // Which language they applied in, so the confirmation matches.
    lang: z.enum(["es", "en"]).optional(),
    q1: text(10, m.short, 3000),
    q2: text(10, m.short, 3000),
    q3: text(6, m.short, 3000),
    notes: optional(3000),

    // anti-spam
    website: z.string().max(500).optional(), // honeypot
    startedAt: z.string().max(20).optional(), // ms timestamp
    turnstileToken: z.string().min(10, m.verify).max(4096),
  });
}

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false as const };
    const data = (await res.json()) as { success?: boolean };
    return { ok: data.success === true };
  } catch {
    return { ok: false as const };
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleSubmit(
  formData: FormData
): Promise<{ errors?: ApplicationErrors; success?: true }> {
  const lang = formData.get("lang") === "en" ? "en" : "es";
  const m = messages(lang);

  // Cross-instance rate limiting: 10 submissions per minute per IP.
  const ip = await getClientIp();
  const rl = await rateLimitDistributed(`carreras:ip:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return { errors: { form: m.tooMany } };
  }

  // The CV is a File, not a string — pull it out before zod sees the rest.
  const cvEntry = formData.get("cv");
  const cvFile = cvEntry instanceof File && cvEntry.size > 0 ? cvEntry : null;

  const raw = Object.fromEntries(
    [...formData.entries()].filter(([k]) => k !== "cv")
  );
  const parsed = formSchema(lang).safeParse(raw);

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
    return { errors: { form: m.invalid } };
  }

  // 2) timing check (bots submit instantly)
  const started = Number(data.startedAt || "0");
  if (!Number.isFinite(started) || started <= 0) return { errors: { form: m.invalid } };
  if (Date.now() - started < 2500) return { errors: { form: m.invalid } };

  // 3) Turnstile verify
  const ok = await verifyTurnstile(data.turnstileToken, ip);
  if (!ok.ok) return { errors: { turnstileToken: m.verifyFailed } };

  // An IP can rotate; an address can be targeted. Count the address only after
  // Turnstile succeeds so a bot cannot exhaust somebody else's email quota.
  // The database receives an HMAC digest, never the raw address.
  const emailLimit = await rateLimitDistributed(
    `carreras:email:${data.email.trim().toLowerCase()}`,
    { limit: 6, windowMs: 10 * 60_000 },
  );
  if (!emailLimit.ok) {
    return { errors: { form: m.tooMany } };
  }

  // ── Optional CV ───────────────────────────────────────────────────
  //
  // Deliberately after the honeypot, timing and Turnstile checks: those are
  // cheap, and there is no reason to read up to 4 MB into memory for a
  // request we are about to reject. Everything is re-checked server-side —
  // a file input's accept attribute and the browser's reported MIME type are
  // both claims, not guarantees, so the bytes themselves decide.
  let cv: { bytes: Uint8Array; name: string; kind: "pdf" | "docx" } | null = null;
  if (cvFile) {
    if (cvFile.size > RESUME_MAX_BYTES) {
      return { errors: { cv: m.cvTooBig } };
    }
    const bytes = new Uint8Array(await cvFile.arrayBuffer());
    const kind = sniffResumeType(bytes);
    if (!kind) {
      return { errors: { cv: m.cvType } };
    }
    cv = { bytes, name: cvFile.name || "cv", kind };
  }

  // 4) Save application to Supabase
  const coverNote = [
    // First line when it exists, so the pipeline's note preview leads with
    // the posting rather than with Q1.
    data.openingTitle ? `Vacante: ${data.openingTitle}` : "",
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

  // Store the CV before the row, so the row can point at it. A storage
  // failure must not cost us the application: the email still carries the
  // attachment, so we log and carry on rather than rejecting the applicant.
  let resumePath: string | undefined;
  if (cv) {
    const stored = await uploadResume(cv.bytes, cv.name, cv.kind, data.email);
    if ("path" in stored) resumePath = stored.path;
    else console.error("[careers] CV not stored:", stored.error);
  }

  // The status token comes back from the insert. If the row never lands there
  // is nothing to point a status page at, so the link is simply omitted rather
  // than sent broken — the application still reaches HR by email.
  let statusToken: string | undefined;
  try {
    const res = await submitApplication({
      name: data.name,
      email: data.email,
      phone: data.phone,
      area: data.area,
      coverNote,
      openingId: data.openingId || undefined,
      resumePath,
      lang: data.lang ?? "es",
    });
    statusToken = res.statusToken;
  } catch {
    // Non-critical — the email is the primary delivery
  }

  // 5) Send branded email via Resend
  const to = process.env.CAREERS_TO_EMAIL || "rrhh@casaolivea.com";

  try {
    await sendCareersEmail({
      to,
      replyTo: data.email,
      openingTitle: data.openingTitle || undefined,
      lang: data.lang ?? "es",
      cv: cv ? { filename: cv.name, bytes: cv.bytes, kind: cv.kind } : undefined,
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
    return { errors: { form: m.sendFailed } };
  }

  // Confirm to the applicant. Deliberately last and deliberately unawaited
  // for its result: HR already has the application, so a failure here must
  // not turn a successful submission into an error on their screen.
  await sendApplicationReceivedEmail({
    to: data.email,
    name: data.name,
    lang: data.lang ?? "es",
    openingTitle: data.openingTitle || undefined,
    statusUrl: statusToken
      ? canonicalUrl(`/${data.lang ?? "es"}/carreras/estado/${statusToken}`)
      : undefined,
  });

  return { success: true };
}
