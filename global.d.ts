// global.d.ts
export {};

import React from "react";

// 1) If you have any other global augments, keep them here…
//    (e.g. your Window.tock definition)

declare global {
  interface Window {
    WhistleLiveChat?: { company: string; source: string };
    tock?: {
      (method: string, ...args: unknown[]): void;
      callMethod?: (method: string, ...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
  }
}

// 2) Augment React’s intrinsic <video> element to include `fetchPriority`
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      video: React.DetailedHTMLProps<
        React.VideoHTMLAttributes<HTMLVideoElement> & {
          /**
           * New & experimental loading‐priority hint.
           * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-fetchpriority
           */
          fetchPriority?: "high" | "low" | "auto";
        },
        HTMLVideoElement
      >;
    }
  }
}