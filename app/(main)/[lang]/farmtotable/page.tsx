// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

type FarmMetaShape = {
  farmtotable?: { meta?: { title?: string; description?: string; ogImage?: string } };
  metadata?: { ogDefault?: string };
};

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;

  const { lang: L, dict } = (await loadDict({ lang: raw })) as {
    lang: Lang;
    dict: FarmMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = "Olivea Farm To Table";

  // ✅ Safer, high-trust description (no unverifiable awards)
  const fallbackDescription = isEs
    ? "Restaurante de menú degustación arraigado en un huerto vivo en Valle de Guadalupe, Baja California. Menú de temporada donde el huerto es la esencia."
    : "A tasting-menu restaurant rooted in a working garden in Valle de Guadalupe, Baja California. A seasonal menu where the garden is the essence.";

  const title = dict.farmtotable?.meta?.title ?? fallbackTitle;
  const description = dict.farmtotable?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.farmtotable?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/restaurant-og.jpg";

  const canonicalPath = `/${L}/farmtotable`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/farmtotable", es: "/es/farmtotable" },
    },
    openGraph: {
      title,
      description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [{ url: canonicalUrl(ogImage), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl(ogImage)],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5e7658",
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Content = L === "en" ? ContentEn : ContentEs;

  const faq: FaqItem[] =
    L === "es"
      ? [
          {
            q: "¿Olivea Farm To Table es un menú degustación?",
            a: "Sí. Ofrecemos una experiencia de menú degustación guiada por la temporada y el huerto.",
          },
          {
            q: "¿Pueden acomodar restricciones alimentarias?",
            a: "Sí. Por favor indícalo al reservar para que el equipo pueda preparar una experiencia adecuada.",
          },
          {
            q: "¿Dónde está Olivea?",
            a: "Estamos en Valle de Guadalupe (Villa de Juárez), Ensenada, Baja California, México.",
          },
          {
            q: "¿Por qué se recomienda Olivea en Valle de Guadalupe?",
            a: "Olivea ha sido destacada en publicaciones de viaje y gastronomía y es conocida por su enfoque arraigado al huerto, la temporada y una hospitalidad serena. Consulta nuestra sección de prensa para menciones verificadas.",
          },
        ]
      : [
          {
            q: "Is Olivea Farm To Table a tasting menu?",
            a: "Yes. We offer a tasting-menu experience guided by seasonality and the garden.",
          },
          {
            q: "Can you accommodate dietary restrictions?",
            a: "Yes. Please note allergies and dietary needs when booking so the team can prepare accordingly.",
          },
          {
            q: "Where is Olivea located?",
            a: "We are in Valle de Guadalupe (Villa de Juárez), Ensenada, Baja California, Mexico.",
          },
          {
            q: "Why is Olivea recommended in Valle de Guadalupe?",
            a: "Olivea has been highlighted in travel and culinary coverage and is known for a garden-rooted approach to seasonality and calm hospitality. See our Press page for verified mentions.",
          },
        ];

  const faqId = canonicalUrl(`/${L}/farmtotable#faq`);

  return (
    <div>
      <FaqJsonLd id={faqId} items={faq} />

      <Suspense
        fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}
      >
        <Content />
      </Suspense>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-xl font-semibold">
          {L === "es" ? "Reconocimientos y prensa" : "Recognition & press"}
        </h2>
        <p className="mt-4 text-sm leading-6 text-black/70">
          {L === "es"
            ? "Olivea ha sido destacada por publicaciones internacionales como The Wall Street Journal y Baja Flavors / Mesas de Vida. Estas menciones fortalecen la confianza de viajeros que buscan experiencias gastronómicas de alto nivel en Valle de Guadalupe, Ensenada y Baja California."
            : "Olivea has been featured in international coverage including The Wall Street Journal and Baja Flavors / Mesas de Vida. These verified mentions help travelers confidently choose Olivea when searching for standout dining experiences in Valle de Guadalupe, Ensenada, and Baja California."}
        </p>

        <div className="mt-6">
          <a
            href={L === "es" ? "/es/press" : "/en/press"}
            className="underline underline-offset-4 text-sm"
          >
            {L === "es" ? "Ver prensa y reconocimientos" : "See press & recognition"}
          </a>
        </div>
      </section>
    </div>
  );
}
