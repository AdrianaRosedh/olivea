'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/en/hero.en.mdx';
import Experience from './content/en/experience.en.mdx';
import Kitchen from './content/en/kitchen.en.mdx';
import Table from './content/en/table.en.mdx';
import Pantry from './content/en/pantry.en.mdx';
import Gallery from './content/en/gallery.en.mdx';
import Menu from './content/en/menu.en.mdx';
import FAQ from './content/en/faq.en.mdx';

export default function ContentEn() {
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
