// app/(linktree)/[lang]/layout.tsx
import type { ReactNode } from "react";

export default function LinktreeLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
