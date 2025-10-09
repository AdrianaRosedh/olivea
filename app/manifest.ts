import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Familia Olivea",
    short_name: "Olivea",
    description: "A farm-to-table sanctuary where nature, nourishment, and design meet.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e9e8e5",
    theme_color: "#65735b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
      // (optional) add maskable versions if you export them:
      // { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      // { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}