'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/en/hero.en.mdx';
import Experience from './content/en/experience.en.mdx';
import Kitchen from './content/en/kitchen.en.mdx';
import Table from './content/en/table.en.mdx';
import Pantry from './content/en/pantry.en.mdx';
import Menu from './content/en/menu.en.mdx';

export default function ContentEn() {
  return (
    <ScrollLimiter topOffsetPx={120} anchorSelector=".subsection" className="snap-container">
      <Hero />
      <Experience />
      <Kitchen />
      <Table />
      <Pantry />
      <Menu />
    </ScrollLimiter>
  );
}
