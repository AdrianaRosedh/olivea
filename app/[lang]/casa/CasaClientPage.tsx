"use client"
import ScrollToSection from "@/components/ScrollToSection"
import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import { useEffect } from "react"

function ScrollInit() {
  useEffect(() => {
    // Force scroll position update after hydration
    const timer = setTimeout(() => {
      // This tiny scroll nudge helps initialize scroll listeners
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)

      // If there's a hash in the URL, scroll to it again
      if (window.location.hash) {
        const id = window.location.hash.substring(1)
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return null // This component doesn't render anything
}

export default function CasaClientPage({
  lang,
  dict,
}: {
  lang: string
  dict: any
}) {
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
    image: "/images/casa-hero.jpg", // Replace with actual image
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

      {/* Add ScrollInit component */}
      <ScrollInit />

      {/* Add ScrollToSection component for improved scrolling */}
      <ScrollToSection />

      {/* Make sure this div has the scroll-container class for ScrollToSection.tsx */}
      <div className="min-h-screen scroll-container snap-y snap-mandatory overflow-y-auto">
        {/* Rooms Section - Improved with semantic HTML and accessibility */}
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

        {/* Breakfast Section - Improved with semantic HTML and accessibility */}
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

        {/* Experiences Section - Improved with semantic HTML and accessibility */}
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

        {/* Location Section - Improved with semantic HTML and accessibility */}
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
