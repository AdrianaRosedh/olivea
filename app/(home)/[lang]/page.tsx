// app/(home)/[lang]/page.tsx
export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient />;
}
