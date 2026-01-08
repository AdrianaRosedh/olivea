'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import Image from 'next/image';

const topImages = [
  { src: '/images/casa/interior.jpg', alt: 'Interior sunlight' },
  { src: '/images/casa/bed.jpg', alt: 'Suite with linen bedding' },
  { src: '/images/casa/lounge.jpg', alt: 'Open living area' },
];

const bottomImages = [
  { src: '/images/casa/lounge.jpg', alt: 'Garden walkway' },
  { src: '/images/casa/pool2.jpg', alt: 'Morning breakfast tray' },
  { src: '/images/casa/patio3.jpg', alt: 'Courtyard with pool' },
];

export default function ScrollGallerySplit() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const topX = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const bottomX = useTransform(scrollYProgress, [0, 1], ['-20%', '0%']);

  return (
    <div
      ref={containerRef}
      className="w-full py-10 md:py-12 overflow-hidden"
    >

      {/* Top row */}
      <motion.div style={{ x: topX }} className="flex gap-6 w-max px-6">
        <div className="min-w-[10vw] md:min-w-[5vw]" />
        {topImages.map((img, i) => (
          <div
            key={`top-${i}`}
            className="relative min-w-[75vw] md:min-w-[35vw] h-[50vh] rounded-2xl overflow-hidden shadow-xl border border-black/10"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 75vw, 35vw"
              quality={80}
              priority={i === 0}
            />
          </div>
        ))}
      </motion.div>

      {/* Bottom row */}
      <motion.div style={{ x: bottomX }} className="flex gap-6 w-max px-6 mt-8 md:mt-10">
        <div className="min-w-[10vw] md:min-w-[5vw]" />
        {bottomImages.map((img, i) => (
          <div
            key={`bottom-${i}`}
            className="relative min-w-[75vw] md:min-w-[35vw] h-[50vh] rounded-2xl overflow-hidden shadow-xl border border-black/10"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 75vw, 35vw"
              quality={80}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
