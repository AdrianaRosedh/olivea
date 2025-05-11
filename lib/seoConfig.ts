import type { DefaultSeoProps } from 'next-seo';

const seoConfig: DefaultSeoProps = {
  defaultTitle: 'Olivea Farm to Table | Hotel, Café, Restaurant',
  description: 'Experience Olivea’s Garden-inspired Hotel, Café, and Farm-to-Table Restaurant.',
  canonical: 'https://oliveafarmtotable.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://oliveafarmtotable.com',
    siteName: 'Olivea Farm to Table',
    images: [
      {
        url: 'https://oliveafarmtotable.com/social.jpg',
        width: 1200,
        height: 630,
        alt: 'Olivea Farm to Table',
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
