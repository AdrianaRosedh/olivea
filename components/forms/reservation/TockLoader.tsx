"use client";

import { useEffect } from "react";

export default function TockLoader() {
  useEffect(() => {
    if (!document.getElementById("tock-js")) {
      const s = document.createElement("script");
      s.id = "tock-js";
      s.src = "https://www.exploretock.com/tock.js";
      s.async = true;
      s.onload = () => {
        window.tock?.("init", "olivea-farm-to-table");
      };
      document.head.appendChild(s);
    }
  }, []);

  return null;
}
