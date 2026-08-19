// Dev-only harness for the team roster editor. The admin is behind auth, so
// this is the only way to actually look at the editor while designing it.
// 404s outside development.
import { notFound } from "next/navigation";
import { TEAM } from "@/app/[lang]/(main)/team/teamData";
import RosterPreviewClient from "./RosterPreviewClient";
import type { RosterMember } from "@/components/admin/TeamRosterEditor";

export const dynamic = "force-dynamic";

export default function RosterPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  // The static array is a faithful copy of what was seeded into the CMS.
  return <RosterPreviewClient initial={TEAM as unknown as RosterMember[]} />;
}
