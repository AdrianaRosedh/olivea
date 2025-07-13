// components/seo/StructuredData.tsx
"use client"; // we’ll still ship this on the client, but we can drop usePathname if we include everything

import Script from "next/script";

export default function StructuredData() {
  // Real data for all three venues:
  const commonAddress = {
    "@type": "PostalAddress",
    streetAddress: "México 3 Km 92.5, 22766 Villa de Juárez",
    addressLocality: "Ensenada",
    addressRegion: "Baja California",
    postalCode: "22766",
    addressCountry: "MX",
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            // Organization root node
            {
              "@type": "Organization",
              name: "Familia Olivea",
              url: "https://www.oliveafarmtotable.com/",
              logo: "https://www.oliveafarmtotable.com/images/oliveaFTT.png",
              sameAs: [
                "https://www.instagram.com/oliveafarmtotable",
                "https://www.instagram.com/oliveacafe",
                "https://www.instagram.com/casaolivea",
                "https://www.facebook.com/oliveafarmtotable",
                "https://www.facebook.com/oliveacafe",
                "https://www.facebook.com/casaolivea",
                "https://www.youtube.com/grupoolivea",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+52-6463836402",
                contactType: "Customer Service",
                availableLanguage: ["Spanish", "English"],
              },
            },

            // Olivea Farm To Table
            {
              "@type": "Restaurant",
              name: "Olivea Farm To Table",
              url: "https://www.oliveafarmtotable.com/farmtotable",
              telephone: "+52-6463836402",
              address: commonAddress,
              geo: {
                "@type": "GeoCoordinates",
                latitude: 31.9909261,
                longitude: -116.6420781,
              },
              servesCuisine: "Farm-to-table",
              priceRange: "$$$",
              hasMap:
                "https://maps.app.goo.gl/oySkL6k7G7t5VFus5",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Wednesday",
                  opens: "17:00",
                  closes: "20:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Friday",
                  opens: "15:30",
                  closes: "20:30",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Sunday",
                  opens: "15:00",
                  closes: "20:00",
                },
              ],
              acceptsReservations: true,
            },

            // Casa Olivea (Hotel)
            {
              "@type": "Hotel",
              name: "Casa Olivea",
              url: "https://www.oliveafarmtotable.com/casa",
              telephone: "+52-6463882369",
              address: commonAddress,
              geo: {
                "@type": "GeoCoordinates",
                latitude: 31.9909261,
                longitude: -116.6420781,
              },
              priceRange: "$$$",
              starRating: {
                "@type": "Rating",
                ratingValue: "5",
              },
            },

            // Olivea Café
            {
              "@type": "CafeOrCoffeeShop",
              name: "Olivea Café",
              url: "https://www.oliveafarmtotable.com/cafe",
              telephone: "+52-6463882369",
              address: commonAddress,
              geo: {
                "@type": "GeoCoordinates",
                latitude: 31.9909261,
                longitude: -116.6420781,
              },
              servesCuisine: "Coffee, Pastries",
              priceRange: "$$",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "07:30",
                  closes: "14:30",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Tuesday",
                  opens: "07:30",
                  closes: "21:30",
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}