"use client";
import { useEffect } from "react";

/** Ensures a single hidden #chatbot-toggle exists in <body>. */
export default function WhistleToggleMount() {
  useEffect(() => {
    const ID = "chatbot-toggle";
    if (!document.getElementById(ID)) {
      const btn = document.createElement("button");
      btn.id = ID;
      btn.style.display = "none";
      document.body.appendChild(btn);
    }
  }, []);
  return null;
}
