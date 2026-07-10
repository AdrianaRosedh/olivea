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
import {
  openSecureDocument,
  type OpenSecureDocResult,
  type ClientFingerprint,
} from "./actions";

const WORKER_PATH = "/pdf.worker.min.mjs";

// OLIVEA brand palette (matches the printed poster).
const CREAM = "#f5f2ea";
const OLIVE = "#2f3a2b";
const OLIVE_MUTED = "#6b7360";
const LINE = "#e4ddcf";
const SERIF = "Georgia, 'Times New Roman', serif";

function OliveaWordmark({ sub = true }: { sub?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.4em",
          color: OLIVE,
          paddingLeft: "0.4em",
        }}
      >
        OLIVEA
      </div>
      {sub && (
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: OLIVE_MUTED,
            marginTop: 3,
          }}
        >
          Farm Hospitality
        </div>
      )}
    </div>
  );
}

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
        docTitle: "Reglamento Interior de Trabajo",
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
        docTitle: "Internal Work Regulations",
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
    const fp = await collectFingerprint().catch(() => null);
    const res = await openSecureDocument(grant, name, passcode, fp);
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
        background: CREAM,
        color: OLIVE,
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
        .sd-input::placeholder { color: ${OLIVE_MUTED}; opacity: 0.6; }
        .sd-input:focus { border-color: ${OLIVE} !important; }
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
          justifyContent: "space-between",
          gap: 8,
          background: "rgba(245,242,234,0.92)",
          backdropFilter: "blur(8px)",
          padding: "12px 18px",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.34em",
            color: OLIVE,
            paddingLeft: "0.34em",
          }}
        >
          OLIVEA
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: OLIVE_MUTED,
          }}
        >
          <ShieldIcon />
          {s.protected}
        </span>
      </div>

      {phase === "form" && (
        <div style={{ display: "grid", placeItems: "center", minHeight: "70vh", padding: 24 }}>
          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              maxWidth: 380,
              display: "flex",
              flexDirection: "column",
              gap: 15,
              background: "#ffffff",
              border: `1px solid ${LINE}`,
              borderRadius: 18,
              padding: "30px 26px",
              boxShadow: "0 8px 30px -14px rgba(47,58,43,0.25)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <OliveaWordmark />
              <div style={{ height: 1, width: 44, background: LINE, margin: "2px 0" }} />
              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: OLIVE, textAlign: "center", lineHeight: 1.25 }}>
                {s.docTitle}
              </div>
              <div style={{ fontSize: 12.5, color: OLIVE_MUTED, textAlign: "center", lineHeight: 1.5 }}>
                {s.intro}
              </div>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: OLIVE_MUTED, letterSpacing: "0.02em" }}>
              {s.name}
              <input
                className="sd-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: OLIVE_MUTED, letterSpacing: "0.02em" }}>
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
              <div style={{ fontSize: 13, color: "#a3341f", lineHeight: 1.4 }}>{formError}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 6,
                padding: "13px 16px",
                borderRadius: 11,
                border: "none",
                background: submitting ? OLIVE_MUTED : OLIVE,
                color: CREAM,
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.04em",
                cursor: submitting ? "default" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {submitting ? s.submitting : s.submit}
            </button>
          </form>
        </div>
      )}

      {phase === "loading" && (
        <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", fontSize: 14, color: OLIVE_MUTED }}>
          {s.loading}
        </div>
      )}

      {phase === "dead" && (
        <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: 24, textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 340 }}>
            <OliveaWordmark />
            <div style={{ fontSize: 14, color: OLIVE }}>{deadMessage}</div>
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
            background: "rgba(245,242,234,0.82)",
            backdropFilter: "blur(40px)",
            textAlign: "center",
            padding: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <OliveaWordmark />
            <div style={{ fontSize: 13, fontWeight: 500, color: OLIVE, marginTop: 4 }}>{s.protected}</div>
            <div style={{ fontSize: 12, color: OLIVE_MUTED }}>{s.hiddenNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "11px 13px",
  borderRadius: 10,
  border: `1px solid ${LINE}`,
  background: "#fbfaf6",
  color: OLIVE,
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
  const urlRef = useRef<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Revoke the blob URL when the page unmounts (free image memory).
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

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
      { rootMargin: "400px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRender || imgSrc) return;
    const doc = docRef.current;
    if (!doc) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const dpr =
          typeof window !== "undefined" && window.devicePixelRatio
            ? Math.min(window.devicePixelRatio, 1.5)
            : 1.5;
        const targetWidth = 820;
        const base = page.getViewport({ scale: 1 });
        const scale = (targetWidth / base.width) * dpr;
        const viewport = page.getViewport({ scale });
        // Render to an OFFSCREEN canvas, bake the watermark, flatten to a
        // BLOB-URL image, then RELEASE the canvas. Blob URLs render far more
        // reliably on iOS than giant base64 data URLs, and freeing the canvas
        // keeps all pages well under Safari's memory caps.
        const canvas = document.createElement("canvas");
        const cw = Math.ceil(viewport.width);
        const ch = Math.ceil(viewport.height);
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          canvas.width = canvas.height = 0;
          return;
        }
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (cancelled) {
          canvas.width = canvas.height = 0;
          return;
        }
        drawWatermark(ctx, cw, ch, watermarkLines);
        const blob = await new Promise<Blob | null>((resolve) => {
          try {
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
          } catch {
            resolve(null);
          }
        });
        // Free the canvas backing store immediately (iOS memory reclaim).
        canvas.width = 0;
        canvas.height = 0;
        if (cancelled || !blob) return;
        const objUrl = URL.createObjectURL(blob);
        urlRef.current = objUrl;
        setImgSrc(objUrl);
      } catch (err) {
        if (cancelled) return;
        console.warn("[SecureDocumentViewer] page render failed:", pageNumber, err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldRender, imgSrc, pageNumber, docRef, watermarkLines]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "block",
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 20px -10px rgba(47,58,43,0.3)",
        position: "relative",
        aspectRatio: `${meta.width} / ${meta.height}`,
      }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={lang === "es" ? `Página ${pageNumber}` : `Page ${pageNumber}`}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            pointerEvents: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
            transition: "opacity 0.25s",
            opacity: loaded ? 1 : 0,
          }}
        />
      )}
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

// ── Passive device fingerprint (no permission prompts) ─────────────────
// Everything here is collected silently from the browser. The `hash` is a
// durable device id built from STABLE signals only, so the same phone signing
// in under different names is linkable even if cookies are cleared.
async function sha256Hex(str: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "";
  }
}

function canvasFingerprint(): string {
  try {
    const c = document.createElement("canvas");
    c.width = 240;
    c.height = 60;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Olivea·Reglamento·◊", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("Olivea·Reglamento·◊", 4, 17);
    return c.toDataURL();
  } catch {
    return "";
  }
}

function webglInfo(): { vendor: string | null; renderer: string | null } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") ||
      c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { vendor: null, renderer: null };
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      vendor: dbg
        ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL))
        : String(gl.getParameter(gl.VENDOR)),
      renderer: dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : String(gl.getParameter(gl.RENDERER)),
    };
  } catch {
    return { vendor: null, renderer: null };
  }
}

async function collectFingerprint(): Promise<ClientFingerprint> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
    userAgentData?: {
      brands?: unknown;
      mobile?: boolean;
      platform?: string;
      getHighEntropyValues?: (h: string[]) => Promise<Record<string, unknown>>;
    };
  };
  const s = window.screen;
  const gl = webglInfo();
  const canvas = canvasFingerprint();
  const canvasHash = canvas ? await sha256Hex(canvas) : null;

  let uaData: Record<string, unknown> | null = null;
  try {
    if (nav.userAgentData) {
      uaData = {
        brands: nav.userAgentData.brands ?? null,
        mobile: nav.userAgentData.mobile ?? null,
        platform: nav.userAgentData.platform ?? null,
      };
      if (nav.userAgentData.getHighEntropyValues) {
        const he = await nav.userAgentData.getHighEntropyValues([
          "model",
          "platformVersion",
          "architecture",
          "bitness",
          "fullVersionList",
        ]);
        uaData = { ...uaData, ...he };
      }
    }
  } catch {
    /* best-effort */
  }

  const data: ClientFingerprint = {
    ua: nav.userAgent,
    platform: nav.platform ?? null,
    language: nav.language ?? null,
    languages: Array.isArray(nav.languages) ? nav.languages : null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    tzOffsetMin: new Date().getTimezoneOffset(),
    screen: {
      w: s.width,
      h: s.height,
      availW: s.availWidth,
      availH: s.availHeight,
      colorDepth: s.colorDepth,
      dpr: window.devicePixelRatio ?? null,
    },
    viewport: { w: window.innerWidth, h: window.innerHeight },
    cores: nav.hardwareConcurrency ?? null,
    memoryGB: nav.deviceMemory ?? null,
    touchPoints: nav.maxTouchPoints ?? 0,
    gpuVendor: gl.vendor,
    gpuRenderer: gl.renderer,
    canvasHash,
    cookieEnabled: nav.cookieEnabled,
    connection: nav.connection
      ? {
          effectiveType: nav.connection.effectiveType ?? null,
          downlink: nav.connection.downlink ?? null,
          rtt: nav.connection.rtt ?? null,
        }
      : null,
    uaData,
    referrer: document.referrer || null,
  };

  // Durable device id — STABLE signals only (no viewport/connection, which vary).
  const stable = JSON.stringify([
    data.ua,
    data.platform,
    data.languages,
    data.timezone,
    data.screen,
    data.cores,
    data.memoryGB,
    data.gpuVendor,
    data.gpuRenderer,
    data.canvasHash,
    uaData,
  ]);
  data.hash = await sha256Hex(stable);
  return data;
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
      style={{ color: OLIVE_MUTED }}
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
