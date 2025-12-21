// app/[lang]/contact/page.tsx
import type { Metadata } from "next";
import { loadLocale }         from "@/lib/i18n";
import ContactForm            from "./contact-form";

export async function generateMetadata({
  params,
}: {
  // Next.js 15.3+ injects params as a Promise<{lang}>
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const p = await params;
  // 2️⃣ Delegate into your helper so you never read p.lang directly
  const { dict } = await loadLocale(p);

  return {
    title:       `${dict.contact.title} | OLIVEA`,
    description: dict.contact.description,
  };
}

export default async function ContactPage({
  params,
}: {
  // Likewise here, params is a Promise<{lang}>
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await & delegate
  const p = await params;
  const { dict } = await loadLocale(p);

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">
        {dict.contact.title}
      </h1>
      <p className="text-muted-foreground mb-6">
        {dict.contact.description}
      </p>

      {/* Your client-side form */}
      <ContactForm lang={p.lang} />
    </main>
  );
}