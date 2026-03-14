import type { DefaultSeoProps } from 'next-seo';
import { canonicalUrl, SITE } from '@/lib/site';

const seoConfig: DefaultSeoProps = {
  defaultTitle: 'Olivea La Experiencia | Hotel, Café, Restaurant',
  description: "Experience Olivea\u2019s Garden-inspired Hotel, Caf\u00e9, and Farm-to-Table Restaurant.",
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
