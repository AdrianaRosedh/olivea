// app/(main)/[lang]/menu/page.tsx
import MenuDeepLinkClient from "./MenuDeepLinkClient";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <MenuDeepLinkClient lang={lang} />;
}
