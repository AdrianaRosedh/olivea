"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Lang = "es" | "en";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ lang?: string }>();
  const lang: Lang = params.lang === "en" ? "en" : "es";

  useEffect(() => {
    console.error("Unhandled error (home):", error);
  }, [error]);

  return (
    <main className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-(--olivea-cream) p-6 text-center">
      <h1 className="text-2xl font-semibold mb-4 text-(--olivea-olive)">
        {lang === "es" ? "Algo salió mal" : "Something went wrong"}
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        {lang === "es"
          ? "Disculpa las molestias. Vuelve a intentarlo en un momento."
          : "We apologize for the inconvenience. Please try again in a moment."}
      </p>
      <Button onClick={reset} variant="default">
        {lang === "es" ? "Reintentar" : "Try again"}
      </Button>
    </main>
  );
}
