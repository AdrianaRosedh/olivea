// app/(main)/layout.tsx
import type { ReactNode } from "react";
import { fontsClass, lora } from "../fonts";
import "./main.css";
import PopupHost from "@/components/ui/popup/PopupHost";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-scope="main"
      className={`${fontsClass} ${lora.variable}`}
    >
      {children}
      {/* Popups only on main pages */}
      <PopupHost />
    </div>
  );
}
