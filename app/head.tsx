// app/head.tsx
export default function Head() {
    return (
      <>
        {/* force-inject CSP so Cloudbeds & Tock can load */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com",
            "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
            "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
          ].join("; ")}
        />
      </>
    );
  }