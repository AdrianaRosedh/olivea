import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { loadLocale } from '@/lib/i18n';
import ContentEs from './ContentEs';
import ContentEn from './ContentEn';
import UnderConstructionNotice from '@/components/forms/UnderConstructionNotice';

type Lang = 'en' | 'es';

export async function generateStaticParams() {
  return (['en','es'] as const).map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const { lang: L, dict } = await loadLocale(params);
  return {
    title: dict.farmtotable.title,
    description: dict.farmtotable.description,
    metadataBase: new URL('https://oliveafarmtotable.com'),
    alternates: {
      canonical: `https://oliveafarmtotable.com/${L}/farmtotable`,
      languages: {
        en: `https://oliveafarmtotable.com/en/farmtotable`,
        es: `https://oliveafarmtotable.com/es/farmtotable`,
      },
    },
    openGraph: {
      title: dict.farmtotable.title,
      description: dict.farmtotable.description,
      locale: L,
      type: 'website',
      images: [{ url: '/images/farmtotable.png', width: 1200, height: 630, alt: dict.farmtotable.title }],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#65735b',
};

export default async function Page({ params }: { params: { lang: Lang } }) {
  const { lang: L } = await loadLocale(params);
  const Content = L === 'en' ? ContentEn : ContentEs;

  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <Content />
      </Suspense>
      <UnderConstructionNotice storageScope="route" />
    </div>
  );
}