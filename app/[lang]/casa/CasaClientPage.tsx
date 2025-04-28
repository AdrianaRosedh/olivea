"use client"

import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import ClientOnly from "@/components/ClientOnly"
import SectionObserver from "@/components/SectionObserver"
import MobileSectionTracker from "@/components/MobileSectionTracker"

// This component remains client-side because it needs interactivity
export default function CasaClientPage({
  lang,
  dict,
}: {
  lang: string
  dict: any
}) {
  // Define section IDs
  const sectionIds = ["rooms", "breakfast", "experiences", "location"]

  // Structured data for better SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Casa Olivea",
    description: dict.casa.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valle de Guadalupe",
      addressRegion: "Baja California",
      addressCountry: "MX",
    },
    priceRange: "$$$",
    telephone: "+52-123-456-7890", // Replace with actual phone
    image: "/images/casa.png", // Updated to use the new image
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Breakfast",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Experiences",
        value: true,
      },
    ],
  }

  return (
    <>
      {/* Add JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Section observer - only rendered on client */}
      <ClientOnly>
        <SectionObserver sectionIds={sectionIds} />
        <MobileSectionTracker sectionIds={sectionIds} />
      </ClientOnly>

      {/* Make sure this div has the scroll-container class */}
      <div
        className="min-h-screen scroll-container snap-y snap-mandatory overflow-y-auto pb-[120px] md:pb-0"
        style={{ height: "100vh" }}
      >
        {/* Rooms Section */}
        <section
          id="rooms"
          className="min-h-screen w-full flex items-center justify-center px-6 snap-center snap-always"
          aria-labelledby="rooms-heading"
        >
          <div>
            <TypographyH2 id="rooms-heading">{dict.casa.sections.rooms.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.rooms.description}</TypographyP>
          </div>
        </section>

        {/* Breakfast Section */}
        <section
          id="breakfast"
          className="min-h-screen w-full flex items-center justify-center px-6 snap-center snap-always"
          aria-labelledby="breakfast-heading"
        >
          <div>
            <TypographyH2 id="breakfast-heading">{dict.casa.sections.breakfast.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.breakfast.description}</TypographyP>
          </div>
        </section>

        {/* Experiences Section */}
        <section
          id="experiences"
          className="min-h-screen w-full flex items-center justify-center px-6 snap-center snap-always"
          aria-labelledby="experiences-heading"
        >
          <div>
            <TypographyH2 id="experiences-heading">{dict.casa.sections.experiences.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.experiences.description}</TypographyP>
          </div>
        </section>

        {/* Location Section */}
        <section
          id="location"
          className="min-h-screen w-full flex items-center justify-center px-6 mb-0 snap-center snap-always"
          aria-labelledby="location-heading"
        >
          <div>
            <TypographyH2 id="location-heading">{dict.casa.sections.location.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.location.description}</TypographyP>
          </div>
        </section>
      </div>
    </>
  )
}
