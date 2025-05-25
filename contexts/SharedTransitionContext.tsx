"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type TransitionState = {
  active: boolean;
  videoSrc: string | null;
  videoPlaybackTime: number;
  targetHref: string;
  
  initialBounds?: DOMRect;
  startTransition: (
    src: string,
    playbackTime: number,
    href: string,
    bounds: DOMRect,
  ) => void;
  clearTransition: () => void;
};

const SharedTransitionContext = createContext<TransitionState | undefined>(undefined);

export function SharedTransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransitionState>({
    active: false,
    videoSrc: null,
    videoPlaybackTime: 0,
    targetHref: "",
    initialBounds: undefined,
    startTransition: () => {},
    clearTransition: () => {},
  });

  const startTransition = (src: string, playbackTime: number, href: string, bounds: DOMRect) => {
    setState({
      active: true,
      videoSrc: src,
      videoPlaybackTime: playbackTime,
      targetHref: href,
      initialBounds: bounds,
      startTransition,
      clearTransition,
    });
  };

  const clearTransition = () => {
    setTimeout(() => {
      setState(prev => ({ ...prev, active: false }));
    }, 300);
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
