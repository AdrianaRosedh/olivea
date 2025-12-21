// app/[lang]/sustainability/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";

type PageProps = {
  // Next 15.3 now passes params as a Promise
  params: Promise<{ lang: string }>;
};

function withBrand(title: string) {
  const t = (title || "").trim();
  if (!t) return "OLIVEA";
  // Avoid double-branding if already present
  if (/\bolivea\b/i.test(t)) return t;
  return `${t} | OLIVEA`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // 1️⃣ Await params
  const p = await params;

  // 2️⃣ Load locale safely
  const { dict } = await loadLocale(p);

  const baseTitle = dict.sustainability.title;
  const description = dict.sustainability.description;

  const pageTitle = withBrand(baseTitle);

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
    },
  };
}

export default async function SustainabilityPage({
  params,
}: PageProps) {
  // 1️⃣ Await params
  const p = await params;

  // 2️⃣ Load locale
  const { dict } = await loadLocale(p);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">
        {dict.sustainability.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {dict.sustainability.description}
      </p>
    </main>
  );
}