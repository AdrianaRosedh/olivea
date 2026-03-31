import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OLIVEA | Farm Hospitality",
    short_name: "OLIVEA",
    description: "Farm hospitality in Valle de Guadalupe — restaurant, farm stay & café born from the garden.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e9e8e5",
    theme_color: "#65735b",
    icons: [
      { src: "/icons/icon-192-v2.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-v2.png", sizes: "512x512", type: "image/png", purpose: "any" }
    ],
  };
}