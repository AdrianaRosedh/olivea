// components/UnderConstructionNotice.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type StorageScope = "site" | "route" | "session";

interface Props {
  storageScope?: StorageScope; // default: "route"
  ttlMs?: number;              // optional expiration in ms
  version?: string;            // bump to re-show ("v3", etc.)
}

export default function UnderConstructionNotice({
  storageScope = "route",
  ttlMs,
  version = "v1",
}: Props) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Build a storage key based on scope
  const baseKey = useMemo(() => {
    const scopePart =
      storageScope === "route" ? `route:${pathname}` :
      storageScope === "session" ? "session" : "site";
    return `olivea_uc_notice_${version}__${scopePart}`;
  }, [pathname, storageScope, version]);

  const storage = storageScope === "session" ? sessionStorage : localStorage;

  // Check/show on mount & on route change (because pathname is in deps)
  useEffect(() => {
    setMounted(true);
    try {
      const raw = storage.getItem(baseKey);
      if (!raw) {
        setOpen(true);
        return;
      }
      // TTL support
      const parsed = JSON.parse(raw) as { ts?: number };
      if (ttlMs && parsed?.ts) {
        const expired = Date.now() - parsed.ts > ttlMs;
        if (expired) {
          setOpen(true);
          return;
        }
      }
      setOpen(false);
    } catch {
      // If parsing/storage fails, just show
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey]); // re-run on route change due to baseKey change

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  const dismiss = () => {
    try {
      const payload = ttlMs ? JSON.stringify({ ts: Date.now() }) : "1";
      storage.setItem(baseKey, payload);
    } catch {}
    setOpen(false);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="uc-title-es"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4"
      data-testid="under-construction"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={dismiss} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <button
          ref={closeBtnRef}
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#65735b]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4 p-6 text-slate-800">
          <div className="space-y-2">
            <h2 id="uc-title-es" className="text-lg font-semibold">Sitio en construcción</h2>
            <p>Estamos trabajando activamente en este sitio. Algunas secciones pueden cambiar o no estar disponibles temporalmente. Gracias por tu paciencia mientras mejoramos la experiencia.</p>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-2">
            <h3 className="text-base font-semibold">Website under construction</h3>
            <p>We’re actively building this site. Some sections may change or be temporarily unavailable. Thank you for your patience while we improve the experience.</p>
          </div>

          <div className="pt-2">
            <button
              onClick={dismiss}
              className="w-full rounded-xl bg-[#65735b] px-4 py-2 text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#65735b]/50"
            >
              Entendido / Got it
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
