"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAdminLocale, type B } from "@/lib/admin/i18n";
import { useScrollLock } from "@/lib/hooks/useScrollLock";

export type ConfirmOptions = {
  title: B;
  body?: B;
  /** Defaults to "Eliminar / Delete" for danger, "Continuar / Continue" otherwise. */
  confirmLabel?: B;
  cancelLabel?: B;
  tone?: "danger" | "default";
};

type Resolver = (ok: boolean) => void;

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(
  async () => false
);

/**
 * Branded replacement for window.confirm().
 *
 * The native dialog renders as "admin.oliveafarmtotable.com says…" in the
 * browser's own chrome — no Olivea palette, no typography, and it blocks the
 * main thread. This keeps destructive confirmations inside the product.
 *
 * Promise-based so call sites read almost identically to what they replaced:
 *   if (!(await confirm({ title, body, tone: "danger" }))) return;
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useAdminLocale();
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<Resolver | null>(null);

  useScrollLock(!!opts);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOpts(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpts(null);
  };

  const danger = opts?.tone === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {opts && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" data-lenis-prevent>
            <motion.button
              type="button"
              aria-label={t({ es: "Cancelar", en: "Cancel" })}
              onClick={() => close(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-[#2d3b29]/25 backdrop-blur-[2px]"
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 4 }}
              transition={{ duration: 0.16 }}
              onKeyDown={(e) => e.key === "Escape" && close(false)}
              className="relative w-full max-w-105 overflow-hidden rounded-2xl bg-[#f7f8f4] shadow-[0_30px_80px_-24px_rgba(45,59,41,0.45)] ring-1 ring-black/[0.06]"
            >
              <div className="flex gap-3.5 px-6 pt-6">
                {danger && (
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertTriangle size={15} />
                  </span>
                )}
                <div className="min-w-0 space-y-1.5">
                  <h2 className="font-serif text-[19px] leading-snug text-[var(--olivea-ink)]">
                    {t(opts.title)}
                  </h2>
                  {opts.body && (
                    <p className="text-[13px] leading-relaxed text-[var(--olivea-clay)]">
                      {t(opts.body)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-black/[0.05] bg-white/40 px-5 py-3">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="rounded-xl px-3.5 py-2 text-[12px] font-medium text-[var(--olivea-clay)] transition-colors hover:bg-black/[0.04] hover:text-[var(--olivea-ink)]"
                >
                  {t(opts.cancelLabel ?? { es: "Cancelar", en: "Cancel" })}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => close(true)}
                  className={`rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 ${
                    danger ? "bg-red-600" : "bg-[var(--olivea-olive)]"
                  }`}
                >
                  {t(
                    opts.confirmLabel ??
                      (danger
                        ? { es: "Eliminar", en: "Delete" }
                        : { es: "Continuar", en: "Continue" })
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

/** Returns confirm(opts) → Promise<boolean>. Resolves false on cancel, backdrop and Escape. */
export function useConfirm() {
  return useContext(ConfirmContext);
}
