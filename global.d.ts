// global.d.ts (at project root)
export {};

declare global {
  interface Window {
    WhistleLiveChat?: { company: string; source: string };
    // Tock stub signature
    tock?: {
      (method: string, ...args: unknown[]): void;
      callMethod?: (method: string, ...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
  }
}
