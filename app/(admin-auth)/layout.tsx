import type { ReactNode } from "react";
import "../globals.css";
import RootShell from "../root-shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <RootShell>{children}</RootShell>;
}
