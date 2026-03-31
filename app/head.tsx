import { SITE } from "@/lib/site";

export default function Head() {
  return (
    <>
      {/* Preconnects */}
      <link rel="preconnect" href={SITE.baseUrl} crossOrigin="" />
      <link rel="preconnect" href="https://static1.cloudbeds.com" crossOrigin="" />
      <link rel="preconnect" href="https://hotels.cloudbeds.com" crossOrigin="" />
      <link rel="preconnect" href="https://www.opentable.com" crossOrigin="" />
      <link rel="preconnect" href="https://www.opentable.com.mx" crossOrigin="" />

      {/*
        NOTE: Organization, WebSite, and entity schemas are rendered by
        <StructuredDataServer /> in route layouts to avoid @id conflicts.
        Do NOT add duplicate JSON-LD here.
      */}
    </>
  );
}
