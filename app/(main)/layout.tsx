// app/(main)/layout.tsx
import type { ReactNode } from "react";
import { fontsClass, lora } from "../fonts";
import "./main.css";
import PopupHost from "@/components/ui/popup/PopupHost";
import SiteBanner from "@/components/ui/banner/SiteBanner";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-scope="main"
      className={`${fontsClass} ${lora.variable}`}
    >
      {children}
      <SiteBanner />
      <PopupHost />
    </div>
  );
}
