// app/d/[token]/SecureDocumentViewer.tsx
// ─────────────────────────────────────────────────────────────────────
// Multi-viewer secure document with a name + shared-passcode sign-in gate,
// for a wall-mounted QR (Reglamento Interior de Trabajo). Flow:
//   1. Worker scans the QR → sees a sign-in form (name + passcode).
//   2. Submit → openSecureDocument() verifies the passcode, requires the
//      name, and LOGS the view (name + time) server-side.
//   3. On success the PDF renders to <canvas> with a watermark baked into
//      the pixels: "OLIVEA · <name> · <time opened>".
//
// Honest scope: a browser can't block screenshots. Protections here:
// passcode gate, named + timestamped in-pixel watermark, access log,
// no download/print, no selectable text, blur-on-blur.
// ─────────────────────────────────────────────────────────────────────
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openSecureDocument, type OpenSecureDocResult } from "./actions";

const WORKER_PATH = "/pdf.worker.min.mjs";

type Props = {
  grant: string | null;
  landingToken: string;
  initialError?: string;
  /** When true (fresh scan/mint), push ?s=<grant> into the address bar so a
   *  copied link is the expiring one; the bare QR URL re-mints each scan. */
  syncUrl?: boolean;
  lang?: "es" | "en";
};
type Phase = "form" | "loading" | "ready" | "dead";
type Grant = Extract<OpenSecureDocResult, { ok: true }>;

const t = (lang: "es" | "en") =>
  lang === "es"
    ? {
        title: "Documento protegido",
        intro: "Escribe tu nombre y el código para ver el documento.",
        name: "Nombre completo",
        passcode: "Código de acceso",
        submit: "Ver documento",
        submitting: "Verificando…",
        loading: "Preparando documento…",
        protected: "Documento protegido",
        hiddenNote: "Oculto mientras la pantalla no está enfocada",
        printBlocked: "Este documento no se puede imprimir.",
        errNameRequired: "Escribe tu nombre.",
        errBadPass: (n: number | null) =>
          n != null
            ? `Código incorrecto. Intentos restantes: ${n}.`
            : "Código incorrecto.",
        errRate: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
        errExpired: "Este documento ya no está disponible.",
        errLinkExpired: "El enlace expiró. Vuelve a escanear el código QR en la pared.",
        errGeneric: "No se pudo abrir el documento. Inténtalo de nuevo.",
      }
    : {
        title: "Protected document",
        intro: "Enter your name and the code to view the document.",
        name: "Full name",
        passcode: "Access code",
        submit: "View document",
        submitting: "Verifying…",
        loading: "Preparing document…",
        protected: "Protected document",
        hiddenNote: "Hidden while the screen is not focused",
        printBlocked: "This document cannot be printed.",
        errNameRequired: "Enter your name.",
        errBadPass: (n: number | null) =>
          n != null ? `Wrong code. Attempts left: ${n}.` : "Wrong code.",
        errRate: "Too many attempts. Wait a moment and try again.",
        errExpired: "This document is no longer available.",
        errLinkExpired: "This link expired. Please scan the wall QR code again.",
        errGeneric: "Couldn't open the document. Please try again.",
      };

export default function SecureDocumentViewer({
  grant,
  landingToken,
  initialError,
  syncUrl,
  lang = "es",
}: Props) {
  const s = t(lang);

  // Fresh mint → reflect the rotating grant in the URL without a server redirect.
  useEffect(() => {
    if (syncUrl && grant) {
      try {
        window.history.replaceState(null, "", `/d/${landingToken}?s=${grant}`);
      } catch {
        /* non-fatal */
      }
    }
  }, [syncUrl, grant, landingToken]);
  // No grant (doc disabled/revoked/expired/not found at the landing) → dead.
  const [phase, setPhase] = useState<Phase>(grant ? "form" : "dead");
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const deadMessage =
    initialError === "revoked" || initialError === "disabled" || initialError === "expired"
      ? s.errExpired
      : s.errGeneric;

  const [openedDoc, setOpenedDoc] = useState<Grant | null>(null);
  const [pages, setPages] = useState<{ width: number; height: number }[]>([]);
  const docRef = useRef<PDFDocumentProxy | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!grant) {
      setFormError(s.errLinkExpired);
      return;
    }
    if (!name.trim()) {
      setFormError(s.errNameRequired);
      return;
    }
    setSubmitting(true);
    const res = await openSecureDocument(grant, name, passcode);
    setSubmitting(false);
    if (!res.ok) {
      setFormError(errorText(res, s));
      return;
    }
    setOpenedDoc(res);
    setPhase("loading");
    try {
      const bytes = base64ToBytes(res.data);
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_PATH;
      }
      const doc = await pdfjs.getDocument({ data: bytes }).promise;
      docRef.current = doc;
      const metas: { width: number; height: number }[] = [];
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const vp = page.getViewport({ scale: 1 });
        metas.push({ width: vp.width, height: vp.height });
      }
      setPages(metas);
      setPhase("ready");
    } catch (err) {
      console.warn("[SecureDocumentViewer] render failed:", err);
      setOpenedDoc(null);
      setPhase("form");
      setFormError(s.errGeneric);
    }
  }

  // Blur-on-blur: hide the doc whenever the screen isn't focused.
  const [obscured, setObscured] = useState(false);
  useEffect(() => {
    const sync = () => setObscured(document.visibilityState !== "visible");
    const onBlur = () => setObscured(true);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const watermarkLines = openedDoc ? buildWatermarkLines(openedDoc, lang) : [];

  return (
    <div
      className="secure-doc-root"
      onContextMenu={(e) => phase === "ready" && e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: "#171717",
        color: "rgba(255,255,255,0.9)",
        WebkitUserSelect: phase === "ready" ? "none" : "auto",
        userSelect: phase === "ready" ? "none" : "auto",
        WebkitTouchCallout: "none",
      }}
    >
      <style>{`
        @media print {
          .secure-doc-root { display: none !important; }
          .secure-doc-print-note { display: block !important; }
        }
        .secure-doc-print-note { display: none; }
        .sd-input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
      <div className="secure-doc-print-note" style={{ padding: 24, color: "#000" }}>
        {s.printBlocked}
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(23,23,23,0.9)",
          backdropFilter: "blur(8px)",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <ShieldIcon />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{s.protected}</span>
      </div>

      {phase === "form" && (
        <div style={{ display: "grid", placeItems: "center", minHeight: "70vh", padding: 24 }}>
          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShieldIcon large />
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
                {s.intro}
              </div>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {s.name}
              <input
                className="sd-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {s.passcode}
              <input
                className="sd-input"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                type="password"
                autoComplete="off"
                inputMode="text"
                style={inputStyle}
              />
            </label>
            {formError && (
              <div style={{ fontSize: 13, color: "#fca5a5" }}>{formError}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 4,
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: submitting ? "rgba(255,255,255,0.2)" : "#e7e5e4",
                color: "#171717",
                fontWeight: 600,
                fontSize: 14,
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? s.submitting : s.submit}
            </button>
          </form>
        </div>
      )}

      {phase === "loading" && (
        <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          {s.loading}
        </div>
      )}

      {phase === "dead" && (
        <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", maxWidth: 320 }}>
            {deadMessage}
          </div>
        </div>
      )}

      {phase === "ready" && (
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 768,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {pages.map((meta, i) => (
            <SecurePage
              key={i}
              pageNumber={i + 1}
              meta={meta}
              docRef={docRef}
              watermarkLines={watermarkLines}
              lang={lang}
            />
          ))}
        </div>
      )}

      {obscured && phase === "ready" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            display: "grid",
            placeItems: "center",
            background: "rgba(23,23,23,0.8)",
            backdropFilter: "blur(40px)",
            textAlign: "center",
            padding: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <ShieldIcon large />
            <div style={{ fontSize: 14, fontWeight: 500 }}>{s.protected}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.hiddenNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  fontSize: 16, // 16px avoids iOS zoom-on-focus
  outline: "none",
};

function errorText(
  res: Extract<OpenSecureDocResult, { ok: false }>,
  s: ReturnType<typeof t>,
): string {
  switch (res.status) {
    case "bad_passcode":
      return s.errBadPass(res.remaining ?? null);
    case "name_required":
      return s.errNameRequired;
    case "rate_limited":
      return s.errRate;
    case "link_expired":
      return s.errLinkExpired;
    case "expired":
    case "revoked":
    case "disabled":
    case "not_found":
      return s.errExpired;
    default:
      return s.errGeneric;
  }
}

function SecurePage({
  pageNumber,
  meta,
  docRef,
  watermarkLines,
  lang,
}: {
  pageNumber: number;
  meta: { width: number; height: number };
  docRef: React.RefObject<PDFDocumentProxy | null>;
  watermarkLines: string[];
  lang: "es" | "en";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendered, setRendered] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldRender(true);
            obs.disconnect();
            return;
          }
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const dpr =
          typeof window !== "undefined" && window.devicePixelRatio
            ? Math.min(window.devicePixelRatio, 2)
            : 1.5;
        const targetWidth = 1100;
        const base = page.getViewport({ scale: 1 });
        const scale = (targetWidth / base.width) * dpr;
        const viewport = page.getViewport({ scale });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (cancelled) return;
        drawWatermark(ctx, canvas.width, canvas.height, watermarkLines);
        setRendered(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("[SecureDocumentViewer] page render failed:", pageNumber, err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldRender, pageNumber, docRef, watermarkLines]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "block",
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 24px -8px rgba(0,0,0,0.5)",
        position: "relative",
        aspectRatio: `${meta.width} / ${meta.height}`,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label={lang === "es" ? `Página ${pageNumber}` : `Page ${pageNumber}`}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          transition: "opacity 0.2s",
          opacity: rendered ? 1 : 0,
        }}
      />
    </div>
  );
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const len = bin.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function buildWatermarkLines(grant: Grant, lang: "es" | "en"): string[] {
  const who = `OLIVEA · ${grant.viewerName}`;
  const when = new Date(grant.grantedAt).toLocaleString(
    lang === "es" ? "es-MX" : "en-US",
    { dateStyle: "short", timeStyle: "short" },
  );
  return [who, when];
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lines: string[],
) {
  if (!lines.length) return;
  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = "#111111";
  const fontSize = Math.max(18, Math.round(w * 0.023));
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const stepX = w * 0.42;
  const stepY = h * 0.15;
  const lineGap = fontSize * 1.25;
  for (let y = stepY * 0.4; y < h + stepY; y += stepY) {
    for (let x = -stepX * 0.25; x < w + stepX; x += stepX) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6);
      lines.forEach((ln, idx) => {
        ctx.fillText(ln, 0, (idx - (lines.length - 1) / 2) * lineGap);
      });
      ctx.restore();
    }
  }
  ctx.restore();
}

function ShieldIcon({ large = false }: { large?: boolean }) {
  const size = large ? 40 : 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "rgba(255,255,255,0.7)" }}
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
