// app/(main)/[lang]/farmtotable/ContentEs.tsx
'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/es/hero.es.mdx';
import Experience from './content/es/experience.es.mdx';
import Kitchen from './content/es/kitchen.es.mdx';
import Table from './content/es/table.es.mdx';
import Pantry from './content/es/pantry.es.mdx';
import Gallery from './content/es/gallery.es.mdx';
import Menu from './content/es/menu.es.mdx';
import FAQ from './content/es/faq.es.mdx';

export default function ContentEs() {
  return (
    <ScrollLimiter
      anchorSelector=".subsection"
    >
      <Hero />
      <Experience />
      <Kitchen />
      <Table />
      <Pantry />
      <Gallery />
      <Menu />
      <FAQ />
    </ScrollLimiter>
  );
}
