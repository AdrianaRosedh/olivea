'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/en/hero.en.mdx';
import Rooms from './content/en/rooms.en.mdx';
import Design from './content/en/design.en.mdx';
import Courtyard from './content/en/courtyard.en.mdx';
import Mornings from './content/en/mornings.en.mdx';
import PracticalInfo from './content/en/practical-info.en.mdx';
import Services from './content/en/services.en.mdx';
import FAQ from './content/en/faq.en.mdx';
import Gallery from './content/en/gallery.en.mdx';

export default function ContentEn() {
  return (
    <ScrollLimiter topOffsetPx={120} anchorSelector=".subsection" className="snap-container scroll-smooth">
      <Hero />
      <Rooms />
      <Design />
      <Courtyard />
      <Mornings />
      <PracticalInfo />
      <Gallery />
      <Services />
      <FAQ />
    </ScrollLimiter>
  );
}
