"use client";

// Catches crashes in the root layout/providers, where route-level
// error boundaries can't help. Must render its own <html>/<body> and
// can't rely on globals.css having loaded — styles are inline.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Global error:", error);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          backgroundColor: "#e7eae1",
          color: "#2d3b29",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          Algo salió mal · Something went wrong
        </h1>
        <p style={{ maxWidth: "28rem", margin: 0, opacity: 0.8 }}>
          Disculpa las molestias. · We apologize for the inconvenience.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem 2rem",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#5e7658",
            color: "#f1f1f1",
            fontSize: "1rem",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          Reintentar · Try again
        </button>
      </body>
    </html>
  );
}
