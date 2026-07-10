// app/d/[token]/page.tsx
// ─────────────────────────────────────────────────────────────────────
// Landing for a secure document: olivea.ai/d/<token> (this is what the
// PRINTED QR encodes — stable, never changes).
//
// Each scan/visit with no ?s mints a short-lived grant and redirects to
// /d/<token>?s=<grant>. That rotating ?s is what lands in the address bar,
// so a link a worker copies & shares expires after grant_ttl_seconds, while
// the wall QR keeps working (every scan mints a fresh grant). With ?s
// present we render the sign-in viewer for that grant.
// ─────────────────────────────────────────────────────────────────────

import SecureDocumentViewer from "./SecureDocumentViewer";
import { mintDocumentGrant } from "./grant";

export const dynamic = "force-dynamic";

export default async function SecureDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { token } = await params;
  const { s } = await searchParams;

  // Existing rotating link → use its grant as-is.
  if (s) {
    return <SecureDocumentViewer grant={s} landingToken={token} lang="es" />;
  }

  // Fresh scan (no ?s) → mint a rotating grant and render the viewer with it.
  // We do NOT use redirect() here: in the streamed production build the redirect
  // fires after the response starts and is silently dropped (200, no Location).
  // Instead the viewer syncs ?s=<grant> into the address bar on the client, so a
  // copied link is still the expiring one while the QR URL re-mints each scan.
  const g = await mintDocumentGrant(token);
  if (g.status === "ok" && g.atoken) {
    return (
      <SecureDocumentViewer
        grant={g.atoken}
        landingToken={token}
        syncUrl
        lang="es"
      />
    );
  }

  // Doc not found / disabled / revoked / expired → dead state.
  return (
    <SecureDocumentViewer grant={null} landingToken={token} initialError={g.status} lang="es" />
  );
}
