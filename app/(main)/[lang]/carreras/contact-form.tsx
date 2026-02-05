"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { handleSubmit, type ApplicationErrors } from "./actions";

type Lang = "es" | "en";
type State = { success?: boolean; errors?: ApplicationErrors };

const initialState: State = { success: false, errors: {} };

const copy = (lang: Lang) => ({
  successTitle: lang === "es" ? "Recibido." : "Received.",
  successBody:
    lang === "es"
      ? "Gracias. Leemos cada aplicación con intención. Si tu perfil encaja, te contactamos pronto."
      : "Thank you. We read every application with intention. If your profile matches, we’ll reach out soon.",
  name: lang === "es" ? "Nombre" : "Name",
  email: lang === "es" ? "Correo" : "Email",
  phone: lang === "es" ? "WhatsApp / Teléfono" : "WhatsApp / Phone",
  area: lang === "es" ? "Área de interés" : "Track",
  availability: lang === "es" ? "Disponibilidad" : "Availability",
  languages: lang === "es" ? "Idiomas" : "Languages",
  role: lang === "es" ? "Rol deseado (opcional)" : "Desired role (optional)",
  links: lang === "es" ? "Links (opcional)" : "Links (optional)",
  notes: lang === "es" ? "Notas (opcional)" : "Notes (optional)",
  submit: lang === "es" ? "Enviar" : "Send",
  sending: lang === "es" ? "Enviando..." : "Sending...",
  verify: lang === "es" ? "Verificación anti-spam" : "Anti-spam verification",
  q1:
    lang === "es"
      ? "¿Qué significa excelencia para ti en tu rol?"
      : "What does excellence mean to you in your role?",
  q2:
    lang === "es"
      ? "Cuéntanos de una vez que recibiste feedback difícil. ¿Qué hiciste?"
      : "Tell us about a time you received difficult feedback. What did you do?",
  q3: lang === "es" ? "¿Por qué Olivea?" : "Why Olivea?",
  placeholders: {
    role: lang === "es" ? "Ej. Barista / Mesero / Cocina / Huerto…" : "e.g. Barista / Service / Kitchen / Garden…",
    links: lang === "es" ? "LinkedIn, portafolio, Instagram profesional…" : "LinkedIn, portfolio, professional Instagram…",
    languages: lang === "es" ? "Ej. Español nativo, Inglés intermedio" : "e.g. Spanish native, English intermediate",
  },
  areas: [
    { v: "foh", l: lang === "es" ? "FOH / Servicio" : "FOH / Service" },
    { v: "boh", l: lang === "es" ? "BOH / Cocina" : "BOH / Kitchen" },
    { v: "garden", l: lang === "es" ? "Huerto / Grounds" : "Garden / Grounds" },
    { v: "hotel", l: lang === "es" ? "Hotel / Casa Olivea" : "Hotel / Casa Olivea" },
    { v: "cafe", l: lang === "es" ? "Café / Padel" : "Café / Padel" },
    { v: "ops", l: lang === "es" ? "Operaciones" : "Operations" },
  ],
  availabilityOptions: [
    { v: "full", l: lang === "es" ? "Tiempo completo" : "Full-time" },
    { v: "part", l: lang === "es" ? "Medio tiempo" : "Part-time" },
    { v: "weekends", l: lang === "es" ? "Fines de semana" : "Weekends" },
    { v: "seasonal", l: lang === "es" ? "Temporal" : "Seasonal" },
  ],
});

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] uppercase tracking-[0.18em] text-(--olivea-olive)/85">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white/70 " +
  "focus:outline-none focus:ring-2 focus:ring-black/15 " +
  "text-[15px] text-(--olivea-ink) placeholder:text-(--olivea-ink)/45";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export default function ContactForm({ lang }: { lang: Lang }) {
  const c = copy(lang);

  // purity-safe: set startedAt in effect
  const [startedAt, setStartedAt] = useState("0");
  useEffect(() => {
    setStartedAt(String(Date.now()));
  }, []);

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);

  const widgetIdRef = useRef<string | null>(null);

  const actionWrapper = useCallback(
    async (_state: State, formData: FormData): Promise<State> => {
      const result = await handleSubmit(formData);
      if (result.success) return { success: true, errors: {} };
      return { success: false, errors: result.errors ?? {} };
    },
    []
  );

  const [state, runAction, isPending] = useActionState(actionWrapper, initialState);

  // Load script once
  useEffect(() => {
    const existing = document.querySelector('script[data-turnstile="1"]');
    if (existing) return;

    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = "1";
    document.head.appendChild(s);
  }, []);

  // Render Managed widget (most reliable)
  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!sitekey) return;

      for (let i = 0; i < 60; i++) {
        if (window.turnstile) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (cancelled || !window.turnstile) return;

      const el = document.getElementById("turnstile-widget");
      if (!el) return;

      if (el.getAttribute("data-rendered") === "1") return;
      el.setAttribute("data-rendered", "1");

      const wid = window.turnstile.render(el, {
        sitekey,
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });

      widgetIdRef.current = wid;
      setTurnstileReady(true);
    };

    mount();
    return () => {
      cancelled = true;
    };
  }, []);

  // reset turnstile if server returned errors
  useEffect(() => {
    const wid = widgetIdRef.current;
    if (!wid || !window.turnstile) return;

    if (state.errors && Object.keys(state.errors).length > 0) {
      setTurnstileToken("");
      try {
        window.turnstile.reset(wid);
      } catch {}
    }
  }, [state.errors]);

  if (state.success) {
    return (
      <div className="rounded-xl bg-white/60 ring-1 ring-black/10 p-5">
        <div className="text-[14px] font-semibold text-(--olivea-ink)">{c.successTitle}</div>
        <p className="mt-2 text-[15px] leading-[1.7] text-(--olivea-ink)/80">{c.successBody}</p>
      </div>
    );
  }

  return (
    <form action={runAction} className="space-y-5">
      {/* honeypot */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="turnstileToken" value={turnstileToken} />

      {/* … your fields stay the same … */}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={c.name} error={state.errors?.name}>
          <input name="name" type="text" className={inputClass} />
        </Field>
        <Field label={c.email} error={state.errors?.email}>
          <input name="email" type="email" className={inputClass} />
        </Field>
        <Field label={c.phone} error={state.errors?.phone}>
          <input name="phone" type="text" className={inputClass} />
        </Field>
        <Field label={c.languages} error={state.errors?.languages}>
          <input name="languages" type="text" className={inputClass} placeholder={c.placeholders.languages} />
        </Field>
        <Field label={c.area} error={state.errors?.area}>
          <select name="area" className={inputClass} defaultValue="">
            <option value="" disabled>{lang === "es" ? "Selecciona…" : "Select…"}</option>
            {c.areas.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
          </select>
        </Field>
        <Field label={c.availability} error={state.errors?.availability}>
          <select name="availability" className={inputClass} defaultValue="">
            <option value="" disabled>{lang === "es" ? "Selecciona…" : "Select…"}</option>
            {c.availabilityOptions.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={c.role} error={state.errors?.role}>
          <input name="role" type="text" className={inputClass} placeholder={c.placeholders.role} />
        </Field>
        <Field label={c.links} error={state.errors?.links}>
          <input name="links" type="text" className={inputClass} placeholder={c.placeholders.links} />
        </Field>
      </div>

      <div className="rounded-2xl bg-white/40 ring-1 ring-black/8 p-4 md:p-5 space-y-5">
        <Field label={c.q1} error={state.errors?.q1}>
          <textarea name="q1" rows={3} className={inputClass} />
        </Field>
        <Field label={c.q2} error={state.errors?.q2}>
          <textarea name="q2" rows={3} className={inputClass} />
        </Field>
        <Field label={c.q3} error={state.errors?.q3}>
          <textarea name="q3" rows={2} className={inputClass} />
        </Field>
      </div>

      <Field label={c.notes} error={state.errors?.notes}>
        <textarea name="notes" rows={3} className={inputClass} />
      </Field>

      {/* Turnstile area */}
      <div className="rounded-2xl bg-white/35 ring-1 ring-black/8 p-4">
        <div className="text-[12px] uppercase tracking-[0.18em] text-(--olivea-olive)/85">
          {c.verify}
        </div>

        {/* Keep it visually calm */}
        <div className="mt-3">
          <div id="turnstile-widget" className="min-h-16.25" />
        </div>

        {!turnstileReady ? (
          <p className="mt-2 text-[12.5px] text-(--olivea-ink)/60">Cargando verificación…</p>
        ) : null}

        {state.errors?.turnstileToken ? (
          <p className="mt-2 text-sm text-red-600">{state.errors.turnstileToken}</p>
        ) : null}
      </div>

      {state.errors?.form ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
          {state.errors.form}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full rounded-full bg-(--olivea-olive) hover:bg-(--olivea-clay) text-white py-6
          uppercase tracking-[0.20em] text-[12px] font-semibold"
        disabled={isPending || startedAt === "0" || !turnstileToken}
      >
        {isPending ? c.sending : c.submit}
      </Button>
    </form>
  );
}
