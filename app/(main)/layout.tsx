// app/(main)/layout.tsx
import type { ReactNode } from "react";
import { fontsClass, lora } from "../fonts"; // adjust path if needed
import "./main.css";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${fontsClass} ${lora.variable}`}>
      <body data-scope="main">
        {children}
      </body>
    </html>
  );
}
