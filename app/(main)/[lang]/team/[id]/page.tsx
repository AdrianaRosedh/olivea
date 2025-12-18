import { notFound } from "next/navigation";
import Image from "next/image";

import { TEAM, getLeader, type Lang } from "../teamData";

/**
 * Pre-generate all team profile pages for both languages
 * This avoids partial params during prerender.
 */
export function generateStaticParams() {
  const langs: Lang[] = ["es", "en"];

  return langs.flatMap((lang) =>
    TEAM.map((leader) => ({
      lang,
      id: leader.id,
    }))
  );
}

export default function TeamProfilePage({
  params,
}: {
  params: { lang?: string; id?: string };
}) {
  const lang: Lang = params.lang === "es" ? "es" : "en";
  const id = params.id;

  const leader = getLeader(id);
  if (!leader) notFound();

  const t = (x?: { es: string; en: string }) => (x ? x[lang] : "");

  return (
    <main className="min-h-100svh bg-(--olivea-cream) text-(--olivea-ink)">
      <div className="mx-auto w-full max-w-[520px] px-6 pt-10 pb-16">
        {/* PROFILE CARD */}
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/10 bg-white/35 backdrop-blur">
          <div className="px-6 pt-7 pb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white/40">
                <Image
                  src={leader.avatar ?? "/images/team/persona.jpg"}
                  alt={leader.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Name + role */}
              <div className="min-w-0">
                <h1
                  className="text-2xl font-semibold leading-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {leader.name}
                </h1>

                <div className="mt-1 text-sm text-(--olivea-ink)/70 truncate">
                  {t(leader.role)}
                  {leader.org ? ` · ${t(leader.org)}` : ""}
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="mt-5 text-sm leading-relaxed text-(--olivea-ink)/80">
              {t(leader.bio) ||
                (lang === "es"
                  ? "Historia en desarrollo — pronto."
                  : "Story in progress — coming soon.")}
            </p>
          </div>
        </div>

        {/* LINKTREE BUTTONS */}
        <div className="mt-6 space-y-3">
          {leader.links.map((link) => {
            const label = t(link.label);
            const isExternal =
              link.href.startsWith("http") ||
              link.href.startsWith("mailto:");

            return (
              <a
                key={`${leader.id}-${label}`}
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={[
                  "group block w-full rounded-2xl px-5 py-4 ring-1 ring-black/10 transition",
                  "bg-white/45 backdrop-blur hover:bg-white/55",
                  link.highlight
                    ? "bg-(--olivea-olive) text-(--olivea-cream) hover:bg-(--olivea-olive)"
                    : "text-(--olivea-ink)",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-medium">{label}</span>
                  <span className="opacity-70">↗</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center text-[11px] tracking-[0.28em] uppercase text-(--olivea-ink)/50">
          OLIVEA
        </div>
      </div>
    </main>
  );
}
