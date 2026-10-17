"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/**
 * The page is the link people pass around, so sharing it is one tap: the
 * phone's own share sheet where there is one, otherwise the link goes to the
 * clipboard and the button says so.
 */
export default function ShareButton({
  url,
  title,
  text,
  label,
  copiedLabel,
  className,
}: {
  url: string;
  title: string;
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url, title, text });
        return;
      } catch (err) {
        // Closing the sheet is not a failure, and not a reason to copy.
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(label, url);
    }
  }

  return (
    <button type="button" onClick={share} className={className}>
      {copied ? (
        <Check size={15} strokeWidth={1.75} aria-hidden />
      ) : (
        <Share2 size={15} strokeWidth={1.75} aria-hidden />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
