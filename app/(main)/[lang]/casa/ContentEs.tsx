'use client';

import ScrollLimiter from '@/components/scroll/ScrollLimiter';
import Hero from './content/es/hero.es.mdx';
import Habitaciones from './content/es/habitaciones.es.mdx';
import Patio from './content/es/patio.es.mdx';
import Diseno from './content/es/diseno.es.mdx';
import Mananas from './content/es/mananas.es.mdx';
import Servicios from './content/es/servicios.es.mdx';
import InfoPractica from './content/es/practical-info.es.mdx';
import FAQ from './content/es/faq.es.mdx';
import Galeria from './content/es/gallery.es.mdx';

export default function ContentEs() {
  return (
    <ScrollLimiter topOffsetPx={120} anchorSelector=".subsection" className="snap-container">
      <Hero />
      <Habitaciones />
      <Diseno />
      <Patio />
      <Mananas />
      <InfoPractica />
      <Galeria />
      <Servicios />
      <FAQ />
    </ScrollLimiter>
  );
}
