// app/(main)/[lang]/team/TeamArticle.tsx
// ─────────────────────────────────────────────────────────────────────
// Server-rendered semantic team roster for crawlers, AI assistants and
// no-JS clients — the same .ssr-article pattern casa/farmtotable/cafe use,
// hidden via CSS once React hydrates.
//
// The visible team page is a tab interface: only the selected member's
// content is rendered, so eleven bilingual bios — the richest unique copy on
// the site — never reached the HTML at all. This puts every profile in the
// markup, with Person microdata and a link to each member's own page.
//
// Driven by the live roster passed in from the page (team_content.members via
// loadTeam), never the static fallback array, so it cannot drift from the CMS.
// ─────────────────────────────────────────────────────────────────────
import Link from "next/link";
import type { LeaderProfile } from "./teamData";

type Lang = "es" | "en";

export default function TeamArticle({
  members,
  lang,
}: {
  members: LeaderProfile[];
  lang: Lang;
}) {
  const isEs = lang === "es";

  return (
    <article
      aria-label={isEs ? "Equipo de Olivea" : "The Olivea Team"}
      className="ssr-article"
      lang={lang}
    >
      <header>
        <h1>
          {isEs
            ? "El equipo de Olivea — Valle de Guadalupe, Baja California"
            : "The Olivea Team — Valle de Guadalupe, Baja California"}
        </h1>
        <p>
          <em>
            {isEs
              ? "Las personas detrás del restaurante con estrella MICHELIN, el hospedaje y el café wine bar. Cada perfil tiene su propia página."
              : "The people behind the MICHELIN-starred restaurant, the farm stay, and the café wine bar. Each profile has its own page."}
          </em>
        </p>
      </header>

      {members.map((m) => {
        const role = m.role?.[lang] ?? m.role?.es ?? "";
        const org = m.org?.[lang] ?? "";
        const bio = m.bio?.[lang] ?? m.bio?.es ?? "";
        return (
          <section
            key={m.id}
            aria-label={m.name}
            itemScope
            itemType="https://schema.org/Person"
          >
            <h2 itemProp="name">{m.name}</h2>
            {role && (
              <p>
                <strong itemProp="jobTitle">{role}</strong>
                {org ? ` · ${org}` : ""}
              </p>
            )}
            {bio && <p itemProp="description">{bio}</p>}
            <p>
              <Link href={`/${lang}/team/${m.id}`} itemProp="url">
                {isEs ? `Ver el perfil de ${m.name} →` : `View ${m.name}'s profile →`}
              </Link>
            </p>
          </section>
        );
      })}
    </article>
  );
}
