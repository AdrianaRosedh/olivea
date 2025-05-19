// components/forms/reservation/TockLoader.tsx
"use client";

import { useEffect } from "react";

type TockFunction = {
  (method: string, ...args: unknown[]): void;
  queue?: [string, ...unknown[]][];
  callMethod?: (method: string, ...args: unknown[]) => void;
};

interface TockLoaderProps {
  /** Your widget-builder JWT from the Tock Widget Builder */
  token: string;
}

export default function TockLoader({ token }: TockLoaderProps) {
  useEffect(() => {
    // if real tock already loaded, skip stub
    if (window.tock && window.tock.callMethod) return;

    // 1) stub
    const stub = ((method: string, ...args: unknown[]) => {
      stub.queue!.push([method, ...args]);
    }) as TockFunction;
    stub.queue = [];

    // 2) assign
    window.tock = stub;

    // 3) inject real script
    const script = document.createElement("script");
    script.src = "https://www.exploretock.com/tock.js";
    script.async = true;
    document.head.appendChild(script);

    // 4) on load, init & replay queue
    const onLoad = () => {
      window.tock!("init", token);
      stub.queue!.forEach(([m, ...a]) => window.tock!(m, ...a));
      delete stub.queue;
    };
    script.addEventListener("load", onLoad);
    return () => {
      script.removeEventListener("load", onLoad);
    };
  }, [token]);

  return null;
}