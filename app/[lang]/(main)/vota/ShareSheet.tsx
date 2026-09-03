"use client";

// app/[lang]/(main)/vota/ShareSheet.tsx
//
// The share button opens this rather than firing a single action, because on
// desktop `navigator.share` mostly doesn't exist and the old button just
// copied silently. Here every common channel is one tap — WhatsApp first,
// since in Mexico that is how a link actually travels — with the native share
// sheet still offered on the phones that have it.
//
// A bottom sheet on mobile, a centred card on desktop; the same dialog either
// way. Brand glyphs are inlined (lucide dropped brand icons), tinted in each
// service's colour so the sheet reads as the familiar share tray it imitates.

import { useCallback, useEffect, useRef, useState } from "react";
import { Mail, Link2, Share2, X, Check } from "lucide-react";
import type { VoteCopy } from "./copy";

/* Brand glyphs — 24×24, single path, currentColor (from simple-icons). */
const WhatsAppIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.946c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.96 11.96 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.945a11.9 11.9 0 00-3.495-8.42z" />
  </svg>
);
const FacebookIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const XIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
const TelegramIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

type Channel = {
  key: string;
  label: string;
  tint: string; // brand colour for the icon disc
  href: string; // "" means it is handled in JS, not a link
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
};

export default function ShareSheet({
  open,
  onClose,
  copy,
}: {
  open: boolean;
  onClose: () => void;
  copy: VoteCopy;
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Resolved at click time on the client; SSR has no location.
  const url = () => (typeof window !== "undefined" ? window.location.href : "https://oliveafarmtotable.com/vota");
  const text = () => `${copy.shareText} ${url()}`;

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  // Escape to close; focus the close button on open.
  useEffect(() => {
    if (!open) return;
    setCopied(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const openChannel = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    onClose();
  }, [onClose]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(copy.shareCopyLabel, url());
    }
  }, [copy.shareCopyLabel]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({ title: "Olivea · Reader's Choice", text: copy.shareText, url: url() });
      onClose();
    } catch {
      // Sheet dismissed — leave ours open so they can still pick a channel.
    }
  }, [copy.shareText, onClose]);

  const channels: Channel[] = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      tint: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(text())}`,
      Icon: WhatsAppIcon,
    },
    {
      key: "facebook",
      label: "Facebook",
      tint: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}&quote=${encodeURIComponent(copy.shareText)}`,
      Icon: FacebookIcon,
    },
    {
      key: "x",
      label: "X",
      tint: "#000000",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy.shareText)}&url=${encodeURIComponent(url())}`,
      Icon: XIcon,
    },
    {
      key: "telegram",
      label: "Telegram",
      tint: "#26A5E4",
      href: `https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(copy.shareText)}`,
      Icon: TelegramIcon,
    },
    {
      key: "email",
      label: copy.shareEmailLabel,
      tint: "#5e7658",
      href: `mailto:?subject=${encodeURIComponent(copy.shareEmailSubject)}&body=${encodeURIComponent(text())}`,
      Icon: (p) => <Mail {...p} />,
    },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          {/* Backdrop — visible immediately; the CSS class only fades it in. */}
          <button
            type="button"
            aria-label={copy.shareEmailLabel === "Correo" ? "Cerrar" : "Close"}
            onClick={onClose}
            className="share-backdrop absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.shareTitle}
            className="
              share-panel relative w-full max-w-md rounded-t-3xl bg-(--olivea-cream) px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-6
              shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.4)]
              sm:rounded-3xl sm:pb-7 sm:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]
            "
          >
            {/* Grab handle (mobile) */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-(--olivea-olive)/25 sm:hidden" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-(family-name:--font-serif) text-2xl font-semibold text-(--olivea-ink)">
                  {copy.shareTitle}
                </h2>
                <p className="mt-1 max-w-[34ch] text-sm text-(--olivea-ink)/65">{copy.shareLead}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={copy.shareEmailLabel === "Correo" ? "Cerrar" : "Close"}
                className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--olivea-ink)/60 hover:bg-(--olivea-olive)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--olivea-olive)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Channels */}
            <div className="mt-6 grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-6">
              {channels.map(({ key, label, tint, href, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => openChannel(href)}
                  className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-(--olivea-olive)"
                    style={{ backgroundColor: tint }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-[11px] font-medium text-(--olivea-ink)/75">{label}</span>
                </button>
              ))}

              {/* Copy link */}
              <button
                type="button"
                onClick={copyLink}
                className="group flex flex-col items-center gap-2 focus-visible:outline-none"
              >
                <span
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-full shadow-sm ring-1 transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-(--olivea-olive)",
                    copied
                      ? "bg-(--olivea-olive) text-white ring-black/5"
                      : "bg-(--olivea-white) text-(--olivea-olive) ring-(--olivea-olive)/20",
                  ].join(" ")}
                >
                  {copied ? <Check className="h-6 w-6" /> : <Link2 className="h-6 w-6" />}
                </span>
                <span className="text-[11px] font-medium text-(--olivea-ink)/75">
                  {copied ? copy.shareCopied : copy.shareCopyLabel}
                </span>
              </button>

              {/* Native share sheet, where the device has one */}
              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--olivea-white) text-(--olivea-olive) shadow-sm ring-1 ring-(--olivea-olive)/20 transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-(--olivea-olive)">
                    <Share2 className="h-6 w-6" />
                  </span>
                  <span className="text-[11px] font-medium text-(--olivea-ink)/75">
                    {copy.shareEmailLabel === "Correo" ? "Más" : "More"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
