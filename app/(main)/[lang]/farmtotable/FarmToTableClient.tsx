// app/(main)/[lang]/farmtotable/FarmToTableClient.tsx
'use client'

import { useEffect } from 'react'
import { motion, Variants, useAnimation } from 'framer-motion'
import MobileSectionTracker from '@/components/navigation/MobileSectionTracker'
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
} from '@/components/ui/Typography'
import type { AppDictionary } from '@/app/(main)/[lang]/dictionaries'

interface Subsection {
  title: string
  description: string
}
interface SectionData {
  title:       string
  description: string
  subsections?: Record<string, Subsection>
}

const SECTION_ORDER = [
  'culinary_philosophy',
  'garden',
  'dining_experiences',
  'atmosphere',
  'chef_team',
  'community',
  'sustainability_commitment',
  'chef_garden_table',
  'local_artisans',
  'colibri_service',
] as const
type SectionKey = typeof SECTION_ORDER[number]

export default function FarmToTableClient({ dict }: { dict: AppDictionary }) {
  const controls = useAnimation()

  useEffect(() => {
    const t = setTimeout(() => controls.start('visible'), 100)
    return () => clearTimeout(t)
  }, [controls])

  // properly typed dictionary
  const sections = dict.farmtotable.sections as Record<SectionKey, SectionData>
  const sectionKeys = SECTION_ORDER.filter((k) => k in sections)
  const sectionIds  = sectionKeys.flatMap((key) => [
    key,
    ...(sections[key].subsections
      ? Object.keys(sections[key].subsections)
      : []),
  ])

  const variants: Variants = {
    hidden:  { y: '100vh' },
    visible: { y: '0', transition: { duration: 1, ease: 'easeInOut' } },
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={variants}
        className="min-h-screen flex flex-col items-center justify-center px-6"
      >
        <header className="text-center mb-12">
          <TypographyH1>{dict.farmtotable.title}</TypographyH1>
          <TypographyP className="mt-2">{dict.farmtotable.description}</TypographyP>
        </header>

        {sectionKeys.map((key) => {
          const sec = sections[key]

          return (
            <section
              key={key}
              id={key}
              className="min-h-screen flex flex-col items-center justify-center space-y-4"
            >
              <TypographyH2>{sec.title}</TypographyH2>
              <TypographyP className="max-w-xl text-center">{sec.description}</TypographyP>

              {sec.subsections &&
                Object.entries(sec.subsections).map(([subId, sub]) => (
                  <section
                    key={subId}
                    id={subId}
                    className="min-h-screen flex flex-col items-center justify-center space-y-2"
                  >
                    <TypographyH3>{sub.title}</TypographyH3>
                    <TypographyP className="max-w-lg text-center">
                      {sub.description}
                    </TypographyP>
                  </section>
                ))}
            </section>
          )
        })}
      </motion.div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  )
}