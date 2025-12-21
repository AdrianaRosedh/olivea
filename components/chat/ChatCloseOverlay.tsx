"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function hasIntent(): boolean {
  try {
    return sessionStorage.getItem("olivea_chat_intent") === "1";
  } catch {
    return false;
  }
}

export default function ChatCloseOverlay() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const update = () => {
      const ok = hasIntent() && document.body.classList.contains("olivea-chat-open");
      setShow(ok);
    };

    update();

    // Watch body class changes + DOM changes (chat widget mutates a lot)
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["class", "style"],
    });

    window.addEventListener("pageshow", update);
    window.addEventListener("resize", update, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener("pageshow", update);
      window.removeEventListener("resize", update);
    };
  }, [mounted]);

  const close = () => {
    // Always close via your toggle
    document.getElementById("chatbot-toggle")?.click();

    document.body.classList.remove("olivea-chat-open");
    try {
      sessionStorage.removeItem("olivea_chat_intent");
    } catch {}
    setShow(false);
  };

  if (!mounted || !show) return null;

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
