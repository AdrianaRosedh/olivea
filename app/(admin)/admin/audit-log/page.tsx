"use client";

import { useEffect, useState, useTransition } from "react";
import { ScrollText, RefreshCw, User } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import { getAuditLog, type AuditLogEntry } from "@/lib/auth/actions";

const ACTION_BADGE: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  update: "bg-amber-50 text-amber-700 border-amber-200/60",
  delete: "bg-red-50 text-red-700 border-red-200/60",
  publish: "bg-blue-50 text-blue-700 border-blue-200/60",
  unpublish: "bg-stone-50 text-stone-700 border-stone-200/60",
  login: "bg-violet-50 text-violet-700 border-violet-200/60",
  invite: "bg-pink-50 text-pink-700 border-pink-200/60",
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionBadgeClass(action: string): string {
  const lower = action.toLowerCase();
  for (const [key, cls] of Object.entries(ACTION_BADGE)) {
    if (lower.includes(key)) return cls;
  }
  return "bg-stone-50 text-stone-600 border-stone-200/60";
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        const rows = await getAuditLog(200);
        setEntries(rows);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load audit log");
      }
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SectionGuard sectionKey="settings.audit">
      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--olivea-olive)]/10">
              <ScrollText className="w-5 h-5 text-[var(--olivea-olive)]" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-stone-800">Audit Log</h1>
              <p className="text-sm text-stone-500">
                Recent admin activity (last 200 entries)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-stone-200/60 bg-white/60 overflow-hidden">
          {entries.length === 0 && !isPending ? (
            <div className="p-12 text-center text-sm text-stone-500">
              No audit entries yet. Admin actions will appear here as they happen.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50/80 text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">When</th>
                  <th className="text-left font-medium px-4 py-2.5">Who</th>
                  <th className="text-left font-medium px-4 py-2.5">Action</th>
                  <th className="text-left font-medium px-4 py-2.5">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {formatTimestamp(e.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <div className="leading-tight">
                          <div className="text-stone-800 font-medium">
                            {e.user_name ?? e.user_email ?? "Unknown"}
                          </div>
                          {e.user_email && e.user_name && (
                            <div className="text-xs text-stone-400">{e.user_email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${actionBadgeClass(
                          e.action
                        )}`}
                      >
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {e.resource_type ? (
                        <>
                          <span className="font-medium text-stone-700">
                            {e.resource_type}
                          </span>
                          {e.resource_id && (
                            <span className="ml-1.5 text-xs text-stone-400">
                              {e.resource_id}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SectionGuard>
  );
}
