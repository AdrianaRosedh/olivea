export {};

declare global {
  interface Window {
    WhistleLiveChat?: {
      company: string;
      source: string;
    };
  }
}
