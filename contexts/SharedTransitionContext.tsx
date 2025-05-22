"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type TransitionState = {
  videoSrc: string | null;
  videoPlaybackTime: number;
  active: boolean;
  targetHref: string;
  targetVideo: string | null;
  initialBounds?: DOMRect;
  startTransition: (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect,
    targetVideo: string
  ) => void;
  clearTransition: () => void;
};

const SharedTransitionContext = createContext<TransitionState | undefined>(undefined);

export function SharedTransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    videoSrc: string | null;
    videoPlaybackTime: number;
    active: boolean;
    targetHref: string;
    targetVideo: string | null;
    initialBounds?: DOMRect;
  }>({
    videoSrc: null,
    videoPlaybackTime: 0,
    active: false,
    targetHref: "",
    targetVideo: null,
    initialBounds: undefined,
  });

  const startTransition = (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect,
    targetVideo: string
  ) => {
    setState({
      videoSrc: src,
      videoPlaybackTime: playbackTime,
      active: true,
      targetHref: href,
      targetVideo: targetVideo,
      initialBounds: bounds,
    });
  };

  const clearTransition = () => {
    setState({
      videoSrc: null,
      videoPlaybackTime: 0,
      active: false,
      targetHref: "",
      targetVideo: null,
      initialBounds: undefined,
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
