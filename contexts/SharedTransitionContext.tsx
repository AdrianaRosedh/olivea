"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type TransitionState = {
  videoSrc: string | null;
  videoPlaybackTime: number;
  active: boolean;
  targetHref: string;
  targetVideo: string | null;         // ✅ added: target video path for destination
  initialBounds?: DOMRect;            // ✅ added previously
  startTransition: (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect,                 // ✅ added
    targetVideo: string              // ✅ added
  ) => void;
  clearTransition: () => void;
};

const SharedTransitionContext = createContext<TransitionState | undefined>(undefined);

export function SharedTransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<TransitionState, "startTransition" | "clearTransition">>({
    videoSrc: null,
    videoPlaybackTime: 0,
    active: false,
    targetHref: "",
    targetVideo: null,              // ✅ added
  });

  const startTransition = (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect,               // ✅ added
    targetVideo: string            // ✅ added
  ) => {
    setState({
      videoSrc: src,
      videoPlaybackTime: playbackTime,
      active: true,
      targetHref: href,
      targetVideo: targetVideo,    // ✅ added
      initialBounds: bounds,       // ✅ added
    });
  };

  const clearTransition = () => {
    setState({
      videoSrc: null,
      videoPlaybackTime: 0,
      active: false,
      targetHref: "",
      targetVideo: null,           // ✅ added
    });
  };

  return (
    <SharedTransitionContext.Provider value={{ ...state, startTransition, clearTransition }}>
      {children}
    </SharedTransitionContext.Provider>
  );
}

export const useSharedTransition = () => {
  const context = useContext(SharedTransitionContext);
  if (!context) throw new Error("useSharedTransition must be used within SharedTransitionProvider");
  return context;
};