import type { DefaultSeoProps } from 'next-seo';
import { canonicalUrl, SITE } from '@/lib/site';

const seoConfig: DefaultSeoProps = {
  defaultTitle: 'Olivea | Farm Hospitality in Valle de Guadalupe',
  description: "Farm hospitality in Valle de Guadalupe — MICHELIN-starred restaurant, farm stay, and caf\u00e9 born from a working garden in Baja California.",
  canonical: canonicalUrl('/'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: canonicalUrl('/'),
    siteName: SITE.name + ' Farm to Table',
    images: [
      {
        url: canonicalUrl('/social.jpg'),
        width: 1200,
        height: 630,
        alt: SITE.name + ' Farm to Table',
      },
    ],
  },
  twitter: {
    handle: '@oliveafarmtotable',
    site: '@oliveafarmtotable',
    cardType: 'summary_large_image',
  },
};

export default seoConfig;
