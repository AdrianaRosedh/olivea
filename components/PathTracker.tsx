// app/components/PathTracker.tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PathTracker() {
  const pathname = usePathname() || "/";
  useEffect(() => {
    const prev = sessionStorage.getItem("prevPath") || "";
    sessionStorage.setItem("prevPathPrev", prev);
    sessionStorage.setItem("prevPath", pathname);
  }, [pathname]);
  return null;
}
