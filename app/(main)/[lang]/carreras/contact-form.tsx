"use client";

import React, { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { type Lang } from "@/lib/i18n";
import { handleSubmit, type ApplicationErrors } from "./actions";
import { CAREER_AREAS, areaLabel, canonicalArea } from "@/lib/careers/areas";
import { RESUME_ACCEPT } from "@/lib/supabase/resume-storage";
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
  applyingFor: lang === "es" ? "Aplicando a la vacante" : "Applying for the role",
  clearRole: lang === "es" ? "Quitar" : "Clear",
  fromPosting: lang === "es" ? "de la vacante" : "from the role",
  linkedNote:
    lang === "es"
      ? "Tu solicitud quedará ligada a esta vacante."
      : "Your application will be linked to this role.",
  links: lang === "es" ? "Links (opcional)" : "Links (optional)",
  cv: lang === "es" ? "CV (opcional)" : "CV (optional)",
  cvHint: lang === "es" ? "PDF o DOCX, máx. 5 MB" : "PDF or DOCX, max 5 MB",
  cvChoose: lang === "es" ? "Adjuntar archivo" : "Attach a file",
  cvRemove: lang === "es" ? "Quitar" : "Remove",
  draftRestored:
    lang === "es"
      ? "Retomamos tu borrador. Se guarda en este dispositivo mientras escribes."
      : "We picked up your draft. It saves on this device as you type.",
  draftDiscard: lang === "es" ? "Empezar de nuevo" : "Start over",
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
  // Areas come from lib/careers/areas so this form and the admin's posting
  // field can never offer different sets again.
  areas: CAREER_AREAS.map((a) => ({ v: a.value, l: lang === "es" ? a.es : a.en })),
  availabilityOptions: [
    { v: "full", l: lang === "es" ? "Tiempo completo" : "Full-time" },
    { v: "part", l: lang === "es" ? "Medio tiempo" : "Part-time" },
    { v: "weekends", l: lang === "es" ? "Fines de semana" : "Weekends" },
    { v: "seasonal", l: lang === "es" ? "Temporal" : "Seasonal" },
  ],
});

let fieldId = 0;

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const id = useMemo(() => name ?? `field-${++fieldId}`, [name]);
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] uppercase tracking-[0.18em] text-(--olivea-olive)/85"
      >
        {label}
      </label>
      <div className="mt-2">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<Record<string, unknown>>(child)) {
            return React.cloneElement(child, {
              id,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": errorId,
            });
          }
          return child;
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const DRAFT_KEY = "olivea:careers-draft";
// Must be re-issued per submission; a stale one fails the anti-spam gate.
const DRAFT_SKIP = new Set(["cv", "turnstileToken", "startedAt", "website"]);

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white/70 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/25 " +
  "text-[15px] text-(--olivea-ink) placeholder:text-(--olivea-ink)/45 focus-custom";

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

  const [cvName, setCvName] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);

  // Applying from a specific posting. OpeningsBoard dispatches this when the
  // "Apply for this role" button is pressed, so the applicant lands on a form
  // that already knows the role and HR's pipeline can attribute the
  // application to the right opening instead of guessing from free text.
  const [applyingFor, setApplyingFor] = useState<{
    openingId: string;
    roleTitle: string;
    area: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    const onApply = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { openingId?: string; roleTitle?: string; area?: string; type?: string }
        | undefined;
      if (!detail?.openingId || !detail.roleTitle) return;
      setApplyingFor({
        openingId: detail.openingId,
        roleTitle: detail.roleTitle,
        area: detail.area ?? "",
        type: detail.type ?? "",
      });
    };
    window.addEventListener("olivea:apply-for-role", onApply);
    return () => window.removeEventListener("olivea:apply-for-role", onApply);
  }, []);

  // The posting's employment type is a sensible default for "how much can you
  // work" — someone applying to a full-time role is presumably available
  // full-time. Still editable; it is the applicant's answer, not the role's.
  // "internship" has no counterpart in the availability list, so it prefills
  // nothing rather than guessing.
  const AVAILABILITY_FROM_TYPE: Record<string, string> = {
    "full-time": "full",
    "part-time": "part",
    seasonal: "seasonal",
  };
  const prefilledAvailability = applyingFor
    ? (AVAILABILITY_FROM_TYPE[applyingFor.type] ?? "")
    : "";

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

  // ── Save and resume ───────────────────────────────────────────────
  //
  // The form asks three essay questions. On a phone that is a lot of typing
  // to lose to a mistap, a call, or a browser reclaiming memory in the
  // background — and losing it once is enough for most people not to start
  // again. The answers live in localStorage until the application is sent.
  //
  // Fields are read and written through the DOM rather than by making every
  // input controlled: the form is uncontrolled by design, and rewiring a
  // dozen fields to state would be a much larger change for the same result.
  //
  // Never saved: the CV (a File cannot be serialised, and caching someone's
  // personal document in their browser is not ours to decide), the Turnstile
  // token, the honeypot, and the timing stamp — all of which must be freshly
  // issued per submission or they defeat the anti-spam checks.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Record<string, string>;

      if (draft.__openingId && draft.__roleTitle) {
        setApplyingFor({
          openingId: draft.__openingId,
          roleTitle: draft.__roleTitle,
          area: draft.__area ?? "",
          type: draft.__type ?? "",
        });
      }

      let filled = 0;
      for (const [key, value] of Object.entries(draft)) {
        if (key.startsWith("__") || !value) continue;
        const el = form.elements.namedItem(key);
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          el instanceof HTMLSelectElement
        ) {
          if (el.type === "file" || el.type === "hidden") continue;
          el.value = value;
          filled++;
        }
      }
      if (filled > 0) setDraftRestored(true);
    } catch {
      /* corrupt or unavailable storage — start clean rather than fail */
    }
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let timer = 0;
    const save = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        try {
          const out: Record<string, string> = {};
          for (const [key, value] of new FormData(form).entries()) {
            if (typeof value !== "string") continue; // the CV
            if (DRAFT_SKIP.has(key)) continue;
            if (value) out[key] = value;
          }
          // Keep the posting link, which lives in React state rather than in
          // a field the DOM pass above can restore.
          if (applyingFor) {
            out.__openingId = applyingFor.openingId;
            out.__roleTitle = applyingFor.roleTitle;
            out.__area = applyingFor.area;
            out.__type = applyingFor.type;
          }
          localStorage.setItem(DRAFT_KEY, JSON.stringify(out));
        } catch {
          /* private mode or quota — losing the draft is not worth an error */
        }
      }, 400);
    };
    form.addEventListener("input", save);
    form.addEventListener("change", save);
    return () => {
      window.clearTimeout(timer);
      form.removeEventListener("input", save);
      form.removeEventListener("change", save);
    };
  }, [applyingFor]);

  // Sent — the draft has served its purpose.
  useEffect(() => {
    if (!state.success) return;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, [state.success]);

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    formRef.current?.reset();
    setApplyingFor(null);
    setCvName(null);
    setDraftRestored(false);
  };

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
    <form ref={formRef} action={runAction} className="space-y-5">
      {/* honeypot */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="turnstileToken" value={turnstileToken} />
      <input type="hidden" name="openingId" value={applyingFor?.openingId ?? ""} />
      {/* Separate from the editable "role" field so the email subject and the
          pipeline note quote what was advertised, not what was typed over it. */}
      <input type="hidden" name="openingTitle" value={applyingFor?.roleTitle ?? ""} />

      {draftRestored && (
        <div className="flex items-start gap-3 rounded-2xl bg-white/45 px-4 py-3 ring-1 ring-black/8">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--olivea-olive)/60"
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-[13.5px] leading-snug text-(--olivea-ink)/70">
            {c.draftRestored}
          </p>
          <button
            type="button"
            onClick={discardDraft}
            className="shrink-0 rounded-lg px-2 py-1 text-[12px] text-(--olivea-ink)/55 transition-colors hover:bg-black/5 hover:text-(--olivea-ink)"
          >
            {c.draftDiscard}
          </button>
        </div>
      )}

      {applyingFor && (
        <div className="flex items-start gap-3 rounded-2xl bg-(--olivea-olive)/8 px-4 py-3 ring-1 ring-(--olivea-olive)/20">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--olivea-olive)"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.2em] text-(--olivea-olive)/85">
              {c.applyingFor}
            </div>
            <div className="mt-0.5 text-[15px] font-semibold text-(--olivea-ink)">
              {applyingFor.roleTitle}
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-(--olivea-ink)/60">
              {c.linkedNote}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setApplyingFor(null)}
            className="shrink-0 rounded-lg px-2 py-1 text-[12px] text-(--olivea-ink)/55 transition-colors hover:bg-black/5 hover:text-(--olivea-ink)"
          >
            {c.clearRole}
          </button>
        </div>
      )}

      {/* … your fields stay the same … */}
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="name" label={c.name} error={state.errors?.name}>
          <input name="name" type="text" className={inputClass} />
        </Field>
        <Field name="email" label={c.email} error={state.errors?.email}>
          <input name="email" type="email" className={inputClass} />
        </Field>
        <Field name="phone" label={c.phone} error={state.errors?.phone}>
          <input name="phone" type="text" className={inputClass} />
        </Field>
        <Field name="languages" label={c.languages} error={state.errors?.languages}>
          <input name="languages" type="text" className={inputClass} placeholder={c.placeholders.languages} />
        </Field>
        <Field name="area" label={c.area} error={state.errors?.area}>
          {/* The select's options are the six operational areas. A posting can
              carry any area HR types — the live one is "Marketing", which is
              not among them — so applying from a posting used to force a
              wrong answer and hand HR a Marketing application filed under
              FOH. From a posting, the area comes from the posting itself. */}
          {applyingFor && applyingFor.area ? (
            <div
              className={`${inputClass} flex items-center justify-between gap-2 bg-(--olivea-olive)/6`}
            >
              <span className="truncate">{areaLabel(applyingFor.area, lang)}</span>
              <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-(--olivea-olive)/75">
                {c.fromPosting}
              </span>
              {/* Store the canonical value even if the posting handed over a label. */}
              <input type="hidden" name="area" value={canonicalArea(applyingFor.area)} />
            </div>
          ) : (
            <select name="area" className={inputClass} defaultValue="">
              <option value="" disabled>{lang === "es" ? "Selecciona…" : "Select…"}</option>
              {c.areas.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
            </select>
          )}
        </Field>
        <Field name="availability" label={c.availability} error={state.errors?.availability}>
          {/* Keyed so choosing a posting re-seeds the default, while leaving
              the applicant free to change it afterwards. */}
          <select
            key={`avail-${applyingFor?.openingId ?? "open"}`}
            name="availability"
            className={inputClass}
            defaultValue={prefilledAvailability}
          >
            <option value="" disabled>{lang === "es" ? "Selecciona…" : "Select…"}</option>
            {c.availabilityOptions.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field name="role" label={c.role} error={state.errors?.role}>
          {/* Keyed so picking a role from a posting remounts the input with the
              new title prefilled, while leaving it editable afterwards. */}
          <input
            key={applyingFor?.openingId ?? "open-application"}
            name="role"
            type="text"
            className={inputClass}
            placeholder={c.placeholders.role}
            defaultValue={applyingFor?.roleTitle ?? ""}
          />
        </Field>
        <Field name="links" label={c.links} error={state.errors?.links}>
          <input name="links" type="text" className={inputClass} placeholder={c.placeholders.links} />
        </Field>
      </div>

      {/* Optional CV. Kept out of the required set on purpose — plenty of
          strong hospitality candidates do not have one to hand, and the three
          questions below tell us more than a CV does. */}
      <Field name="cv" label={c.cv} error={state.errors?.cv}>
        <div className={`${inputClass} flex items-center gap-3`}>
          <label className="cursor-pointer rounded-lg bg-(--olivea-olive)/10 px-3 py-1.5 text-[13px] font-medium text-(--olivea-olive) transition-colors hover:bg-(--olivea-olive)/16 focus-within:ring-2 focus-within:ring-(--olivea-olive)/40">
            {c.cvChoose}
            <input
              type="file"
              name="cv"
              accept={RESUME_ACCEPT}
              className="sr-only"
              onChange={(e) => setCvName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-(--olivea-ink)/70">
            {cvName ?? c.cvHint}
          </span>
          {cvName && (
            <button
              type="button"
              onClick={() => {
                setCvName(null);
                const el = document.querySelector<HTMLInputElement>('input[name="cv"]');
                if (el) el.value = "";
              }}
              className="shrink-0 rounded-lg px-2 py-1 text-[12px] text-(--olivea-ink)/55 transition-colors hover:bg-black/5 hover:text-(--olivea-ink)"
            >
              {c.cvRemove}
            </button>
          )}
        </div>
      </Field>

      <div className="rounded-2xl bg-white/40 ring-1 ring-black/8 p-4 md:p-5 space-y-5">
        <Field name="q1" label={c.q1} error={state.errors?.q1}>
          <textarea name="q1" rows={3} className={inputClass} />
        </Field>
        <Field name="q2" label={c.q2} error={state.errors?.q2}>
          <textarea name="q2" rows={3} className={inputClass} />
        </Field>
        <Field name="q3" label={c.q3} error={state.errors?.q3}>
          <textarea name="q3" rows={2} className={inputClass} />
        </Field>
      </div>

      <Field name="notes" label={c.notes} error={state.errors?.notes}>
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
