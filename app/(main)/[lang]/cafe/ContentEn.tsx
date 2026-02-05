"use client";

import ScrollLimiter from "@/components/scroll/ScrollLimiter";

import Hero from "./content/en/hero.en.mdx";
import Experience from "./content/en/experience.en.mdx";
import Breakfast from "./content/en/breakfast.en.mdx";
import Bread from "./content/en/bread.en.mdx";
import Padel from "./content/en/padel.en.mdx";
import Menu from "./content/en/menu.en.mdx";
import Gallery from "./content/en/gallery.en.mdx";
import FAQ from "./content/en/faq.en.mdx";

export default function ContentEn() {
  return (
    <ScrollLimiter
      topOffsetPx={120}
      anchorSelector=".subsection"
      className="snap-container scroll-smooth"
    >
      <Hero />
      <Experience />
      <Breakfast />
      <Bread />
      <Padel />
      <Gallery />
      <Menu />
      <FAQ />
    </ScrollLimiter>
  );
}