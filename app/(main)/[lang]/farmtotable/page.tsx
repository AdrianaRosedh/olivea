// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { loadLocale } from '@/lib/i18n'
import FarmToTable from './content.mdx'
import UnderConstructionNotice from "@/components/forms/UnderConstructionNotice";


export async function generateStaticParams() {
  return (['en','es'] as const).map(lang => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const { lang: L, dict } = await loadLocale(params)
  return {
    title:       dict.farmtotable.title,
    description: dict.farmtotable.description,
    metadataBase: new URL('https://oliveafarmtotable.com'),
    alternates:  {
      canonical: `https://oliveafarmtotable.com/${L}/farmtotable`,
      languages: {
        en: `https://oliveafarmtotable.com/en/farmtotable`,
        es: `https://oliveafarmtotable.com/es/farmtotable`,
      },
    },
    openGraph: {
      title:       dict.farmtotable.title,
      description: dict.farmtotable.description,
      locale:      L,
      type:        'website',
      images: [
        { url: '/images/farmtotable.png', width: 1200, height: 630, alt: dict.farmtotable.title },
      ],
    },
  }
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#65735b',
}

export default async function Page({ params }: { params: { lang: string } }) {
  const { dict } = await loadLocale(params)
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <FarmToTable dict={dict} />
      </Suspense>
      {/* Under construction popup (ES first, then EN) */}
        <UnderConstructionNotice storageScope="route"/>
    </div>
  )
}