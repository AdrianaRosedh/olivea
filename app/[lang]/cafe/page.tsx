import { Suspense } from "react"
import { getDictionary } from "../dictionaries"
import MenuItems from "./menu-items"

export default async function CafePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.cafe.title}</h1>
      <p className="mt-2 text-muted-foreground mb-6">{dict.cafe.description}</p>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuItems lang={lang} />
      </Suspense>
    </main>
  )
}

function MenuSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-60"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
