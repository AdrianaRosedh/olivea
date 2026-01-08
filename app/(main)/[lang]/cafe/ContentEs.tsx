'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero        from './content/es/hero.es.mdx';
import Experiencia from './content/es/experiencia.es.mdx';
import Desayuno    from './content/es/desayuno.es.mdx';
import Pan         from './content/es/pan.es.mdx';
import Padel       from './content/es/padel.es.mdx';
import Bebidas     from './content/es/bebidas.es.mdx';

export default function ContentEs() {
  return (
    <ScrollLimiter topOffsetPx={120} anchorSelector=".subsection" className="snap-container scroll-smooth">
      <Hero />
      <Experiencia />
      <Desayuno />
      <Pan />
      <Padel />
      <Bebidas />
    </ScrollLimiter>
  );
}
