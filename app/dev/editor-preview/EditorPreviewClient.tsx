"use client";

import { useState } from "react";
import { AdminLocaleProvider } from "@/lib/admin/i18n";
import JournalEditor from "@/components/admin/JournalEditor";
import type { JournalPost } from "@/lib/content/types";

const MOCK: JournalPost = {
  id: "00000000-0000-4000-8000-000000000001",
  title: {
    es: "El mar también es nuestro huerto",
    en: "The Sea Is Also Our Garden",
  },
  slug: "el-mar-tambien-es-nuestro-huerto",
  excerpt: {
    es: "A diez minutos del restaurante empieza el origen. Visitar a nuestros productores del Pacífico reafirma el territorio.",
    en: "Ten minutes from the restaurant, origin begins. Visiting our Pacific producers reaffirms the territory.",
  },
  body: {
    es: "<p>La marea baja antes del amanecer y el muelle huele a salitre.</p><h2>El origen</h2><p>Cada semana recorremos la costa con los mismos pescadores.</p>",
    en: "<p>The tide drops before dawn and the dock smells of brine.</p><h2>Origin</h2><p>Each week we walk the coast with the same fishermen.</p>",
  },
  coverImage: undefined,
  coverAlt: undefined,
  author: "Adriana Rose",
  authors: [{ id: "adrianarose", name: "Adriana Rose" }],
  status: "draft",
  tags: ["territorio", "productores"],
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-25T10:00:00.000Z",
};

export default function EditorPreviewClient() {
  const [open, setOpen] = useState(true);
  const noop = async () => {};

  return (
    <AdminLocaleProvider initialLocale="es">
      <div className="min-h-screen bg-[var(--olivea-cream)]/40 p-6">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[var(--olivea-olive)] px-4 py-2 text-sm text-white"
        >
          Open editor
        </button>
        <JournalEditor
          post={MOCK}
          open={open}
          onClose={() => setOpen(false)}
          onSave={noop}
          onPublish={noop}
          onUnpublish={noop}
        />
      </div>
    </AdminLocaleProvider>
  );
}
