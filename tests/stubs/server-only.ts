// Test stand-in for the `server-only` marker. Next.js resolves the real module
// during builds (where importing it from client code fails the build); unit
// tests run plain Node, where the marker has nothing to guard.
export {};
