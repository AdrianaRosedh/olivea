"use client";

import Image from "next/image";
import CardParallax from "@/components/mdx/CardParallax";
import Reveal from "@/components/scroll/Reveal";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function HeroSection({ data, lang }: SectionProps) {
  const imgSrc = data.image?.src ?? "/images/casa/hero.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Casa Olivea";
  const logoSrc = data.logo?.src ?? "/brand/herocasa.svg";
  const logoAlt = t(data.logo?.alt, lang) || "Casa Olivea";
  const heading = t(data.heading, lang) || "Casa Olivea";
  const slogan = t(data.slogan, lang);
  const cta1 = t(data.cta1, lang) || "RESERVE";
  const cta1Aria = t(data.cta1Aria, lang) || cta1;
  const cta2 = t(data.cta2, lang) || "Services";
  const cta2Aria = t(data.cta2Aria, lang) || cta2;

  return (
    <section
      id="hero"
      className="hero-pill relative w-full snap-start"
      style={{
        height:
          "calc(100svh - var(--dock-left, 0px) - var(--dock-right, 0px) - var(--header-h, 0px))",
      }}
    >
      <CardParallax
        src={imgSrc}
        alt={imgAlt}
        speed={0.3}
        fit="cover"
        objectPosition="50% 40%"
        priority
        quality={58}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white pointer-events-none px-6">
        <Reveal preset="fade" delay={0.05}>
          <div className="relative w-[min(280px,60vw)] aspect-[3/1]">
            <Image src={logoSrc} alt={logoAlt} fill className="object-contain" />
          </div>
        </Reveal>

        <h1 className="sr-only">{heading}</h1>

        <Reveal preset="up" delay={0.12}>
          <div className="mt-4">
            <span className="md:hidden text-[clamp(0.7rem,1.8vw,0.85rem)] tracking-[0.22em] uppercase opacity-85">
              {slogan}
            </span>
            <span className="hidden md:flex items-center gap-4 text-[clamp(0.7rem,0.85vw,0.95rem)] tracking-[0.22em] uppercase opacity-85">
              <span className="h-px w-10 bg-white/40" />
              {slogan}
              <span className="h-px w-10 bg-white/40" />
            </span>
          </div>
        </Reveal>

        <Reveal preset="fade" delay={0.18}>
          <div className="mt-8 flex items-center gap-5 pointer-events-auto">
            <button
              aria-label={cta1Aria}
              className="rounded-full bg-white/15 backdrop-blur-md px-7 py-2.5 text-[13px] font-semibold tracking-widest uppercase ring-1 ring-white/30 transition hover:bg-white/25"
              onMouseEnter={() =>
                window.dispatchEvent(new CustomEvent("olivea:reserve-intent"))
              }
              onClick={() =>
                window.dispatchEvent(new CustomEvent("olivea:reserve"))
              }
            >
              {cta1}
            </button>

            <a
              href="#services"
              aria-label={cta2Aria}
              className="text-[13px] tracking-widest uppercase opacity-70 hover:opacity-100 transition"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("services");
                if (!el) return;
                const headerH = parseInt(
                  getComputedStyle(document.documentElement)
                    .getPropertyValue("--header-h")
                    .replace("px", ""),
                  10
                ) || 0;
                const top =
                  el.getBoundingClientRect().top + window.scrollY - headerH - 16;
                window.scrollTo({ top, behavior: "smooth" });
                history.replaceState(null, "", "#services");
              }}
            >
              {cta2}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
