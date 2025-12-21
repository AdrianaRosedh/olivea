"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function isChatOpenFromDom(): boolean {
  const host = document.getElementById("w-live-chat");
  if (!host) return false;

  // Common “open” signals across widgets:
  // - display not none
  // - visibility not hidden
  // - has non-zero client rect
  const style = window.getComputedStyle(host);
  if (style.display === "none" || style.visibility === "hidden") return false;

  const rect = host.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export default function ChatCloseOverlay() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const update = () => {
      const isOpen = isChatOpenFromDom();
      setOpen(isOpen);

      // keep body flag in sync (optional but nice)
      document.body.classList.toggle("olivea-chat-open", isOpen);
    };

    update();

    const host = document.getElementById("w-live-chat");
    const obs = new MutationObserver(update);

    if (host) {
      obs.observe(host, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden", "aria-hidden"],
      });
    }

    // Also listen to viewport changes (mobile rotations / Safari address bar)
    window.addEventListener("resize", update, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [mounted]);

  const close = () => {
    const toggleBtn = document.getElementById("chatbot-toggle");
    toggleBtn?.click();

    // Don’t rely on the observer alone for immediate UX
    document.body.classList.remove("olivea-chat-open");
    setOpen(false);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <button
      type="button"
      onClick={close}
      aria-label="Cerrar chat"
      className={[
        "fixed md:hidden",
        "top-[calc(env(safe-area-inset-top,0px)+10px)]",
        "right-[calc(env(safe-area-inset-right,0px)+10px)]",
        "z-2147483647",
        "h-10 w-10 rounded-full",
        "grid place-items-center",
        "bg-black/70 text-white",
        "backdrop-blur",
        "ring-1 ring-white/20",
        "active:scale-95",
      ].join(" ")}
    >
      <X className="h-5 w-5" />
    </button>,
    document.body
  );
}
