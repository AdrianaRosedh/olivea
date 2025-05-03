declare module 'granim' {
    // very minimal typing just so TS stops complaining
    interface GranimOptions {
      element: HTMLCanvasElement;
      direction?: string;
      isPausedWhenNotInView?: boolean;
      image?: { source: string; blendingMode?: string };
      states: Record<string, { gradients: [string, string][]; transitionSpeed?: number }>;
    }
    export default class Granim {
      constructor(options: GranimOptions);
      changeState(stateName: string): void;
      destroy(): void;
    }
  }