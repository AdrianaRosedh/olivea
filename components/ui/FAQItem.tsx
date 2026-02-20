"use client";

import { useState } from "react";

export default function FAQItem({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 border-b border-black/10 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-left w-full text-lg font-medium text-oliveaText"
      >
        {q}
      </button>

      {open && <div className="mt-2 text-oliveaMuted text-base">{children}</div>}
    </div>
  );
}