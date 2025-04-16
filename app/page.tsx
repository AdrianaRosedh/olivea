// app/page.tsx

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // You can comment this out until you install shadcn/ui

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] flex items-center justify-center text-white text-center">
        <Image
          src="/images/hero.jpg"
          alt="Olivea Garden"
          fill
          className="object-cover -z-10"
          priority
        />
        <div className="bg-black/40 p-6 rounded-xl">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight">
            Welcome to Olivea
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light">
            A farm-to-table sanctuary where nature, nourishment, and design meet.
          </p>
          <div className="mt-6 flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/restaurant">
              <Button variant="secondary">Visit the Restaurant</Button>
            </Link>
            <Link href="/casa">
              <Button variant="ghost">Stay at Casa Olivea</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}