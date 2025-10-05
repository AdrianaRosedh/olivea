'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/es/hero.es.mdx';
import Experience from './content/es/experience.es.mdx';
import Kitchen from './content/es/kitchen.es.mdx';
import Table from './content/es/table.es.mdx';
import Pantry from './content/es/pantry.es.mdx';
import Menu from './content/es/menu.es.mdx';

export default function ContentEs() {
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
