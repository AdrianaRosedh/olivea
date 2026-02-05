// app/(main)/[lang]/journal/author/[id]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

import type { Lang } from "@/app/(main)/[lang]/dictionaries";
import { listJournalIndex } from "@/lib/journal/load";
import { absoluteUrl, SITE } from "@/lib/site";
import {
  getAuthorProfile,
  localizedAuthorBio,
  localizedAuthorTitle,
} from "@/lib/journal/authors";
import { normalizeAuthor } from "@/lib/journal/author";
import { getLeader } from "@/app/(main)/[lang]/team/teamData";

function fmtDate(iso: string, lang: Lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  const out = `${a}${b}`.toUpperCase();
  return out || "O";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "es" ? "es" : "en";

  return {
    title: lang === "es" ? "Autor | Journal de Olivea" : "Author | Olivea Journal",
    robots: { index: true, follow: true },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "es" ? "es" : "en";
  const authorId = p.id;

  const items = await listJournalIndex(lang);

  const byAuthor = items.filter((it) => {
    const a = normalizeAuthor(it.author, lang);
    return a.id === authorId;
  });

  if (byAuthor.length === 0) return notFound();

  // ✅ team membership (controls leader line visibility)
  const teamMember = getLeader(authorId);
  const isTeamAuthor = !!teamMember;

  // Team hub link (NOT individual linktree)
  const teamHubHref = `/${lang}/team`;

  // Still keep individual linktree click behavior for avatar + name/title
  const teamLinktreeHref = `/${lang}/team/${authorId}`;

  const profile = getAuthorProfile(authorId);
  const displayName =
    profile?.name ?? normalizeAuthor(byAuthor[0].author, lang).name;

  const title = profile ? localizedAuthorTitle(profile, lang) : undefined;
  const bio = profile ? localizedAuthorBio(profile, lang) : undefined;

  const authorUrl = `${SITE.baseUrl}/${lang}/journal/author/${authorId}`;
  const personId = `${authorUrl}#person`;

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: displayName,
    url: authorUrl,
    image: profile?.image ? absoluteUrl(profile.image) : undefined,
    jobTitle: title,
    description: bio,
    worksFor: profile?.worksFor
      ? {
          "@type": "Organization",
          "@id": `${SITE.baseUrl}#organization`,
          name: profile.worksFor,
          url: absoluteUrl("/"),
        }
      : undefined,
    sameAs: profile?.sameAs?.length ? profile.sameAs : undefined,
  };

  const initials = initialsFromName(displayName);

  const leaderLine = lang === "es"
    ? "Esta autora es líder en Olivea."
    : "This author is a leader at Olivea.";

  const teamHubLabel = lang === "es" ? "Conoce al equipo" : "Meet the team";

  return (
    <main className="mx-auto w-full max-w-215 px-6 pb-20 pt-12 md:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      <header className="mb-12">
        <div className="text-[12px] uppercase tracking-[0.32em] text-(--olivea-olive) opacity-70">
          {lang === "es" ? "Autor" : "Author"}
        </div>

        <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          {/* Avatar: clickable to Linktree ONLY if team author (new tab) */}
          <div className="shrink-0">
            {isTeamAuthor ? (
              <Link
                href={teamLinktreeHref}
                target="_blank"
                rel="noreferrer"
                className="group block"
                aria-label={lang === "es" ? "Abrir perfil del equipo" : "Open team profile"}
                title={lang === "es" ? "Abrir perfil del equipo" : "Open team profile"}
              >
                <div
                  className={[
                    "relative overflow-hidden",
                    "h-28 w-28 md:h-36 md:w-36",
                    "rounded-[28px] md:rounded-[34px]",
                    "bg-white/22",
                    "ring-1 ring-(--olivea-olive)/16",
                    "backdrop-blur-md",
                    "shadow-[0_10px_30px_rgba(18,24,16,0.10)]",
                    "transition-transform duration-300",
                    "group-hover:scale-[1.02]",
                  ].join(" ")}
                >
                  {profile?.image ? (
                    <>
                      <Image
                        src={profile.image}
                        alt={displayName}
                        fill
                        sizes="(max-width: 768px) 112px, 144px"
                        className="object-cover"
                        priority
                      />
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-(--olivea-cream)/55">
                      <span className="text-[28px] md:text-[34px] font-semibold tracking-[-0.02em] text-(--olivea-olive) opacity-75">
                        {initials}
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/55 px-2 py-1 text-[11px] text-(--olivea-olive) opacity-80 ring-1 ring-(--olivea-olive)/10">
                    {lang === "es" ? "Perfil" : "Profile"}
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className={[
                  "relative overflow-hidden",
                  "h-28 w-28 md:h-36 md:w-36",
                  "rounded-[28px] md:rounded-[34px]",
                  "bg-white/22",
                  "ring-1 ring-(--olivea-olive)/16",
                  "backdrop-blur-md",
                  "shadow-[0_10px_30px_rgba(18,24,16,0.10)]",
                ].join(" ")}
              >
                {profile?.image ? (
                  <>
                    <Image
                      src={profile.image}
                      alt={displayName}
                      fill
                      sizes="(max-width: 768px) 112px, 144px"
                      className="object-cover"
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-(--olivea-cream)/55">
                    <span className="text-[28px] md:text-[34px] font-semibold tracking-[-0.02em] text-(--olivea-olive) opacity-75">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Name + title (clickable to linktree only if team author), bio, links, leader line -> team hub */}
          <div className="min-w-0">
            <div className="min-w-0">
              {isTeamAuthor ? (
                <Link
                  href={teamLinktreeHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-block"
                  aria-label={lang === "es" ? "Abrir perfil del equipo" : "Open team profile"}
                  title={lang === "es" ? "Abrir perfil del equipo" : "Open team profile"}
                >
                  <h1
                    className={[
                      "text-4xl font-semibold tracking-tight text-(--olivea-olive) md:text-5xl",
                      "whitespace-nowrap",
                      "group-hover:underline group-hover:underline-offset-4",
                    ].join(" ")}
                  >
                    {displayName}
                  </h1>

                  {title ? (
                    <div className="mt-3 text-[13px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-75 group-hover:opacity-90">
                      {title}
                    </div>
                  ) : null}
                </Link>
              ) : (
                <>
                  <h1 className="text-4xl font-semibold tracking-tight text-(--olivea-olive) md:text-5xl whitespace-nowrap">
                    {displayName}
                  </h1>

                  {title ? (
                    <div className="mt-3 text-[13px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-75">
                      {title}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-(--olivea-clay) opacity-90">
              {bio ??
                (lang === "es"
                  ? "Artículos publicados en el Journal de Olivea."
                  : "Articles published in Olivea’s Journal.")}
            </p>

            {profile?.sameAs?.length ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {profile.sameAs.map((href) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] underline underline-offset-4 text-(--olivea-olive) opacity-80 hover:opacity-100"
                  >
                    {href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                ))}
              </div>
            ) : null}

            {/* ✅ Replace "Open team profile" with leader line that links to /team */}
            {isTeamAuthor ? (
              <div className="mt-5">
                <Link
                  href={teamHubHref}
                  className="text-[13px] text-(--olivea-olive) opacity-80 hover:opacity-100 underline underline-offset-4"
                >
                  {leaderLine}{" "}
                  <span className="opacity-80">{teamHubLabel}</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <Link
          href={`/${lang}/journal`}
          className="mt-8 inline-block text-[13px] underline underline-offset-4 text-(--olivea-olive) opacity-80 hover:opacity-100"
        >
          {lang === "es" ? "Volver al Journal" : "Back to Journal"}
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {byAuthor.map((post) => (
          <Link
            key={`${post.lang}:${post.slug}`}
            href={`/${lang}/journal/${post.slug}`}
            className="group block overflow-hidden rounded-3xl bg-white/18 ring-1 ring-(--olivea-olive)/10 backdrop-blur-md transition hover:bg-white/22"
          >
            {post.cover?.src ? (
              <div className="relative h-56 w-full bg-(--olivea-cream)/40">
                <Image
                  src={post.cover.src}
                  alt={post.cover.alt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                />
              </div>
            ) : null}

            <div className="p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-70">
                {fmtDate(post.publishedAt, lang)} · {post.readingMinutes} min
              </div>

              <h2 className="mt-3 text-[20px] font-medium leading-tight text-(--olivea-olive)">
                {post.title}
              </h2>

              <p className="mt-2 text-[14px] leading-relaxed text-(--olivea-clay) opacity-90">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}