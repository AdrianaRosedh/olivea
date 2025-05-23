import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grupo Olivea",
    short_name: "Olivea",
    description: "A farm-to-table sanctuary where nature, nourishment, and design meet.",
    start_url: "/",
    display: "standalone",
    background_color: "#e9e8e5",
    theme_color: "#65735b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
