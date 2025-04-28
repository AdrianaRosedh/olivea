"use client"

import { usePathname } from "next/navigation"

interface StructuredDataProps {
  lang: string
}

export default function StructuredData({ lang }: StructuredDataProps) {
  const pathname = usePathname()

  // Restaurant structured data
  const restaurantData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Olivea Farm To Table",
    image: "https://olivea.com/images/restaurant.png",
    url: `https://olivea.com/${lang}/restaurant`,
    telephone: "+52-123-456-7890",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Valle de Guadalupe",
      addressLocality: "Ensenada",
      addressRegion: "Baja California",
      postalCode: "22750",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.1234,
      longitude: -116.5678,
    },
    servesCuisine: "Farm-to-table",
    priceRange: "$$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday", "Friday", "Saturday", "Sunday"],
        opens: "13:00",
        closes: "22:00",
      },
    ],
    menu: `https://olivea.com/${lang}/restaurant/menu`,
    acceptsReservations: "True",
  }

  // Hotel structured data
  const hotelData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Casa Olivea",
    image: "https://olivea.com/images/casa.png",
    url: `https://olivea.com/${lang}/casa`,
    telephone: "+52-123-456-7890",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Valle de Guadalupe",
      addressLocality: "Ensenada",
      addressRegion: "Baja California",
      postalCode: "22750",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.1234,
      longitude: -116.5678,
    },
    priceRange: "$$$",
    starRating: {
      "@type": "Rating",
      ratingValue: "5",
    },
  }

  // Cafe structured data
  const cafeData = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "Olivea Café",
    image: "https://olivea.com/images/cafe.png",
    url: `https://olivea.com/${lang}/cafe`,
    telephone: "+52-123-456-7890",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Valle de Guadalupe",
      addressLocality: "Ensenada",
      addressRegion: "Baja California",
      postalCode: "22750",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.1234,
      longitude: -116.5678,
    },
    servesCuisine: "Coffee, Pastries",
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
  }

  // Organization structured data (for the parent company)
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Olivea",
    url: `https://olivea.com/${lang}`,
    logo: "https://olivea.com/images/oliveaFTT.png",
    sameAs: ["https://www.instagram.com/olivea", "https://www.facebook.com/olivea", "https://twitter.com/olivea"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+52-123-456-7890",
      contactType: "customer service",
      availableLanguage: ["English", "Spanish"],
    },
  }

  // Determine which structured data to use based on the current path
  let structuredData = organizationData

  if (pathname.includes("/restaurant")) {
    structuredData = restaurantData
  } else if (pathname.includes("/casa")) {
    structuredData = hotelData
  } else if (pathname.includes("/cafe")) {
    structuredData = cafeData
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}
