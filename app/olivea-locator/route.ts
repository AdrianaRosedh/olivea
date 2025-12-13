// app/olivea-locator/route.ts
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

type Lang = "es" | "en";
function normalizeLang(raw: string | null): Lang {
  return raw === "en" ? "en" : "es";
}

const copy = {
  es: {
    title: "Olivea Locator",
    address2Short: "Ensenada, B.C., México",
    address2Long: "Ensenada, Baja California, México",
  },
  en: {
    title: "Olivea Locator",
    address2Short: "Ensenada, B.C., Mexico",
    address2Long: "Ensenada, Baja California, Mexico",
  },
} satisfies Record<Lang, { title: string; address2Short: string; address2Long: string }>;

export async function GET(req: NextRequest) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID; 

  if (!key) {
    return new NextResponse("Missing NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY", { status: 500 });
  }

  // You *can* choose to hard-fail if missing Map ID:
  // if (!mapId) return new NextResponse("Missing NEXT_PUBLIC_GOOGLE_MAP_ID", { status: 500 });

  const lang = normalizeLang(req.nextUrl.searchParams.get("lang"));
  const t = copy[lang];

  const html = `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <title>${t.title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">

    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600&display=swap" rel="stylesheet">

    <style>
      html, body { height: 100%; margin: 0; background: #e7eae1; }

      gmpx-store-locator {
        width: 100%;
        height: 100%;
        --gmpx-color-surface: #f1f1f1;
        --gmpx-color-on-surface: #5e7658;
        --gmpx-color-on-surface-variant: rgba(94,118,88,0.7);
        --gmpx-color-primary: #5e7658;
        --gmpx-color-outline: rgba(94,118,88,0.2);

        --gmpx-font-family-base: "Plus Jakarta Sans", system-ui, sans-serif;
        --gmpx-font-family-headings: "Lora", serif;
        --gmpx-font-size-base: 0.95rem;

        --gmpx-fixed-panel-width-row-layout: 28.5em;
        --gmpx-fixed-panel-height-column-layout: 60%;

        --gmpx-search-bar-margin-top: 1.25rem;
      }

      gmpx-store-locator::part(panel) { padding-top: 1.25rem !important; }
      gmpx-store-locator::part(header) { padding-top: 0.25rem !important; }

      gmpx-store-locator ::part(search-label),
      gmpx-store-locator ::part(search-field-label),
      gmpx-store-locator ::part(input-label) { display: none !important; }

      gmpx-store-locator ::part(search-input),
      gmpx-store-locator ::part(input) { line-height: 1.2 !important; }

      gmpx-store-locator ::part(search-input) {
        padding-top: 12px !important;
        padding-bottom: 12px !important;
      }

      gmpx-store-locator label { display: none !important; }
    </style>

    <script>
      const CONFIGURATION = {
        locations: [
          {
            title: "Olivea Café",
            address1: "Carretera Federal #3 Km 92.5",
            address2: "${t.address2Short}",
            coords: { lat: 31.9908168, lng: -116.6421964 },
            placeId: "ChIJ8chTvsP72IARSvB3fdU_IXs"
          },
          {
            title: "Olivea Farm to Table",
            address1: "Carretera Federal #3 Km 92.5",
            address2: "${t.address2Short}",
            coords: { lat: 31.9909261, lng: -116.6420781 },
            placeId: "ChIJbYfJrqXt2IARBBKPw8lnU2w"
          },
          {
            title: "Casa Olivea",
            address1: "Carretera Federal #3 Km 92.5",
            address2: "${t.address2Long}",
            coords: { lat: 31.9909784, lng: -116.6421103 },
            placeId: "ChIJre413DXt2IARY0L-nk6BVHE"
          }
        ],
        mapOptions: {
          center: { lat: 31.99093, lng: -116.6421 },
          zoom: 16,
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          maxZoom: 17,
          mapId: "${mapId ?? ""}"  // ✅ was "" before
        },
        mapsApiKey: "${key}",
        capabilities: {
          input: true,
          autocomplete: true,
          directions: false,
          distanceMatrix: true,
          details: false,
          actions: false
        }
      };
    </script>

    <script type="module">
      document.addEventListener('DOMContentLoaded', async () => {
        await customElements.whenDefined('gmpx-store-locator');
        document.querySelector('gmpx-store-locator')
          .configureFromQuickBuilder(CONFIGURATION);
      });
    </script>
  </head>

  <body>
    <script type="module"
      src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js">
    </script>

    <gmpx-api-loader
      key="${key}"
      solution-channel="GMP_QB_locatorplus_v11_cABD">
    </gmpx-api-loader>

    <gmpx-store-locator></gmpx-store-locator>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Language": lang === "en" ? "en" : "es-MX",
      Vary: "Accept-Language",
    },
  });
}