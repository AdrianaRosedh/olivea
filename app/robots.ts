import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.oliveafarmtotable.com/sitemap.xml",
    host: "https://www.oliveafarmtotable.com",
  };
}
