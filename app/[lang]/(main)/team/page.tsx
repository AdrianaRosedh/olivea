// app/(main)/[lang]/team/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import { SITE, canonicalUrl, withShare } from "@/lib/site";
import TeamClient, { type TeamDict } from "./TeamClient";
import { loadTeam } from "./teamData";
import { toFaqItems } from "@/lib/seo/faq";
import { getContent } from "@/lib/content";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import TeamArticle from "./TeamArticle";

type PageProps = {
  params: Promise<{ lang: string }>;
};

function isTeamDict(x: unknown): x is TeamDict {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.description === "string";
}

function withBrand(title: string) {
  // Prevent double-branding if a translator already wrote “— Olivea / OLIVEA”
  const t = title.trim();
  if (/\bolivea\b/i.test(t)) return t;
  return `${t} | OLIVEA`;
}

async function pageMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  const { dict } = await loadLocale(p);
  const lang: "en" | "es" = p.lang === "en" ? "en" : "es";

  const maybeteam = (dict as { team?: unknown }).team;

  const baseTitle = isTeamDict(maybeteam)
    ? maybeteam.title
    : lang === "es"
      ? "Equipo"
      : "Team";

  const description = isTeamDict(maybeteam) ? maybeteam.description : "";

  const title = withBrand(baseTitle);
  const path = `/${lang}/team`;
  const url = canonicalUrl(path);
  const isEs = lang === "es";

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
    },
  };
}

export default async function TeamPage({ params }: PageProps) {
  const p = await params;
  const { dict } = await loadLocale(p);

  const lang: "en" | "es" = p.lang === "en" ? "en" : "es";
  const maybeteam = (dict as { team?: unknown }).team;

  const team: TeamDict = isTeamDict(maybeteam)
    ? (() => {
        const mt = maybeteam as Record<string, unknown>;
        const leadersTitle =
          typeof mt.leadersTitle === "string" ? mt.leadersTitle : undefined;
        const leadersHint =
          typeof mt.leadersHint === "string" ? mt.leadersHint : undefined;
        const body =
          typeof mt.body === "string" || Array.isArray(mt.body)
            ? (mt.body as TeamDict["body"])
            : undefined;

        return {
          ...(maybeteam as TeamDict),
          leadersTitle:
            leadersTitle ??
            (lang === "es" ? "Líderes de Olivea" : "Leaders of Olivea"),
          leadersHint,
          body,
        };
      })()
    : {
        title: lang === "es" ? "Equipo" : "Team",
        description: "",
        leadersTitle: lang === "es" ? "Líderes de Olivea" : "Leaders of Olivea",
      };

  const members = await loadTeam();

  // ✅ Entity FAQ — the exact "who is X" questions AI gets, answered from our
  // facts. Kept in team_content.faq and edited in /admin/content/team.
  const faqId = canonicalUrl(`/${lang}/team#faq`);
  const faq: FaqItem[] = toFaqItems((await getContent("team")).faq, lang);

  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <FaqJsonLd id={faqId} items={faq} />

      {/* Server-rendered roster for crawlers and no-JS clients; hidden once
          React hydrates. The visible page is a tab UI, so without this the
          eleven bios never appear in the HTML. */}
      <TeamArticle members={members} lang={lang as "es" | "en"} />
      <TeamClient lang={lang} team={team} members={members} />
    </main>
  );
}

export async function generateMetadata(
  props: Parameters<typeof pageMetadata>[0]
): Promise<Metadata> {
  const { lang } = await props.params;
  return withShare(await pageMetadata(props), { lang, path: "/team" });
}
