"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type TransitionState = {
  videoSrc: string | null;
  videoPlaybackTime: number;
  active: boolean;
  targetHref: string;
  initialBounds?: DOMRect; // ✅ added
  startTransition: (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect // ✅ added
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
  });

  const startTransition = (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect // ✅ added
  ) =>
    setState({
      videoSrc: src,
      videoPlaybackTime: playbackTime,
      active: true,
      targetHref: href,
      initialBounds: bounds, // ✅ added
    });

  const clearTransition = () => setState({ videoSrc: null, videoPlaybackTime: 0, active: false, targetHref: "" });

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