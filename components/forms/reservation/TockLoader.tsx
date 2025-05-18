// components/forms/reservation/TockLoader.tsx
"use client";

import { useEffect } from "react";

/**
 * Full Tock API stub type.
 */
interface TockFunction {
  (method: string, ...args: unknown[]): void;
  callMethod?: (method: string, ...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
}

interface TockLoaderProps {
  /** Your Tock business token */
  business: string;
}

/**
 * TockLoader injects Tock.js once, stubs the API, and initializes with your business token.
 */
export default function TockLoader({ business }: TockLoaderProps) {
  useEffect(() => {
    // Only inject once
    if (!window.tock) {
      // Create stub that queues calls until the real script loads
      const stub = (function (method: string, ...args: unknown[]) {
        console.log("[TockStub] call received:", method, ...args);
        if (stub.callMethod) {
          console.log("[TockStub] forwarding to real tock");
          stub.callMethod(method, ...args);
        } else {
          console.log("[TockStub] queueing call until script is ready");
          stub.queue!.push([method, ...args]);
        }
      } as unknown) as TockFunction;

      // initialize stub metadata + queue
      stub.queue = [];
      stub.loaded = true;
      stub.version = "1.0";

      // assign stub to global window.tock
      window.tock = stub;

      // inject the external Tock.js script
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.exploretock.com/tock.js";
      document.head.appendChild(script);

      // on load, initialize Tock and flush queued calls
      const handleLoad = () => {
        console.log("[TockStub] tock.js loaded, initializing with business token");
        window.tock!("init", business);
        // if any calls were queued before load, they will be flushed by Tock's own logic
      };
      script.addEventListener("load", handleLoad);

      return () => {
        script.removeEventListener("load", handleLoad);
      };
    }
  }, [business]);

  return null;
}