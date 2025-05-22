// app/(home)/layout.tsx
import { ReactNode } from "react";
import { HomeProviders } from "./HomeProviders";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <HomeProviders>{children}</HomeProviders>;
}
