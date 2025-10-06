'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter'
import Hero from './content/en/hero.en.mdx'
import Experience from './content/en/experience.en.mdx'
import Breakfast from './content/en/breakfast.en.mdx'
import Bread from './content/en/bread.en.mdx'
import Padel from './content/en/padel.en.mdx'
import Drinks from './content/en/drinks.en.mdx'

export default function ContentEn() {
  return (
    <ScrollLimiter topOffsetPx={120} anchorSelector=".subsection" className="snap-container">
      <Hero />
      <Experience />
      <Breakfast />
      <Bread />
      <Padel />
      <Drinks />
    </ScrollLimiter>
  );
}




