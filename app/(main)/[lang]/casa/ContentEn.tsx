'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/en/hero.en.mdx'
import Rooms from './content/en/rooms.en.mdx'
import Courtyard from './content/en/courtyard.en.mdx'
import Design from './content/en/design.en.mdx'
import Mornings from './content/en/mornings.en.mdx'
import Services from './content/en/services.en.mdx'

export default function ContentEn() {
  return (
    <ScrollLimiter topOffsetPx={120} anchorSelector=".subsection" className="snap-container">
      <Hero />
      <Rooms />
      <Courtyard />
      <Design />
      <Mornings />
      <Services />
    </ScrollLimiter>
  );
}