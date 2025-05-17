export {};

declare global {
  interface Window {
    WhistleLiveChat?: {
      company: string;
      source: string;
    };
    tock?: {
      callMethod?: (method: string, ...args: unknown[]) => void;
    };
  }
}
