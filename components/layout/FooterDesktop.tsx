"use client";

import dynamic from "next/dynamic";
import DesktopOnly from "./DesktopOnly";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";

const Footer = dynamic(() => import("./Footer"), {
  ssr: false,
  loading: () => null,
});

export default function FooterDesktop({ dict }: { dict: AppDictionary }) {
  return (
    <DesktopOnly>
      <Footer dict={dict} />
    </DesktopOnly>
  );
}
