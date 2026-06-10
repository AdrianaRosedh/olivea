import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNodeMetrics } = await import("./monitoring/node-metrics");
    registerNodeMetrics();
  }
}

/**
 * Server-side error reporting (Next.js instrumentation hook).
 * Logs one structured JSON line per uncaught server error — searchable in
 * Vercel runtime logs (and the natural seam for Sentry later: replace the
 * console.error with a captureException call).
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? (error as { digest?: string }).digest
      : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      source: "onRequestError",
      message: error instanceof Error ? error.message : String(error),
      digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      revalidateReason: context.revalidateReason,
      timestamp: new Date().toISOString(),
    })
  );
};
