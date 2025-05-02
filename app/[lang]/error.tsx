"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Lang } from "./dictionaries";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const rawLang = params.lang;
  const lang: Lang = rawLang === "es" ? "es" : "en";

  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We apologize for the inconvenience. Our team has been notified of this
        issue.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button onClick={() => router.push(`/${lang}`)} variant="outline">
          Go to {lang === "es" ? "inicio" : "homepage"}
        </Button>
      </div>
    </div>
  );
}