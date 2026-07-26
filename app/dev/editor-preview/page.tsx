// Dev-only design harness for the journal editor.
//
// The admin is behind auth, which makes the editor impossible to look at while
// designing it — every visual change had to be judged from source. This route
// renders the editor with mock data and no-op handlers so it can be opened and
// iterated on directly. It 404s outside development and is never reachable in
// production.
import { notFound } from "next/navigation";
import EditorPreviewClient from "./EditorPreviewClient";

export const dynamic = "force-dynamic";

export default function EditorPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <EditorPreviewClient />;
}
