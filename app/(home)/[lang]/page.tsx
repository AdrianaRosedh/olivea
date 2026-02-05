// app/(home)/[lang]/page.tsx
import HomeClient from "./HomeClient";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default function Page() {
  return <HomeClient />;
}
