"use client";

import { useState } from "react";
import { AdminLocaleProvider } from "@/lib/admin/i18n";
import TeamRosterEditor, { type RosterMember } from "@/components/admin/TeamRosterEditor";

export default function RosterPreviewClient({ initial }: { initial: RosterMember[] }) {
  const [members, setMembers] = useState<RosterMember[]>(initial);

  return (
    <AdminLocaleProvider initialLocale="es">
      {/* Mirrors the admin shell's ink/clay contrast overrides so the editor is
          judged against the colours it actually renders in. */}
      <div
        className="min-h-screen bg-[#f4f5f0] p-6"
        style={
          {
            "--olivea-ink": "#2d3b29",
            "--olivea-clay": "#6b7a65",
          } as React.CSSProperties
        }
      >
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-[var(--olivea-clay)]">
            Roster editor — dev preview ({members.length})
          </h1>
          <div className="rounded-2xl bg-white/40 p-6 ring-1 ring-black/5">
            <TeamRosterEditor value={members} onChange={setMembers} />
          </div>
        </div>
      </div>
    </AdminLocaleProvider>
  );
}
