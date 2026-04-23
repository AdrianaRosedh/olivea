import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDock from "@/components/admin/AdminDock";
import AdminContent from "@/components/admin/AdminContent";
import { DockProvider } from "@/components/admin/AdminDockContext";
import { AuthProvider } from "@/components/admin/AuthProvider";
import { PaletteProvider } from "@/components/admin/CommandPalette";
import { getSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mockUser } from "@/lib/admin/mock-user";

export const metadata: Metadata = {
  title: "Olivea Admin",
  description: "Olivea content management portal",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user;

  if (isSupabaseConfigured) {
    // Production: require authenticated session
    try {
      user = await getSession();
    } catch {
      user = null;
    }

    // If Supabase is configured but no session, redirect to login
    // (Next.js 16 DAL pattern — auth enforced in server components, not middleware)
    if (!user) {
      redirect("/admin/login");
    }
  } else {
    // Development: no Supabase configured — use mock user
    user = mockUser;
  }

  const resolvedUser = user;

  return (
    <AuthProvider initialUser={resolvedUser}>
      <DockProvider>
        <PaletteProvider>
        <div
          className="min-h-screen bg-[#f4f5f0] text-[var(--olivea-ink)]"
          style={{
            /* WCAG AA overrides for admin — darken ink and clay for small-text contrast */
            "--olivea-ink": "#2d3b29",
            "--olivea-clay": "#6b7a65",
          } as React.CSSProperties}
        >
          {/* Soft organic texture — barely visible grain */}
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(94,118,88,0.03) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Warm gradient wash at top */}
          <div
            className="fixed top-0 left-0 right-0 h-[400px] pointer-events-none opacity-60"
            style={{
              background: "linear-gradient(180deg, rgba(231,234,225,0.8) 0%, rgba(244,245,240,0) 100%)",
            }}
          />

          {/* Dock */}
          <AdminDock />

          {/* Main content area — margin animates with dock width */}
          <AdminContent>
            {children}
          </AdminContent>
        </div>
        </PaletteProvider>
      </DockProvider>
    </AuthProvider>
  );
}
