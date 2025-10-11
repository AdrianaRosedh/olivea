// app/(home)/[lang]/page.tsx
import LcpPlate from "./LcpPlate";
import HomeClient from "./HomeClient"; // ⟵ direct import of Client Component

export default function HomePage() {
  return (
    <>
      <LcpPlate />
      <HomeClient />
    </>
  );
}
