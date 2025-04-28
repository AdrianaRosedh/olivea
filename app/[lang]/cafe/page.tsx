import { Suspense } from "react"
import { getDictionary } from "../dictionaries"
import MenuItems from "./menu-items"

// Improved menu skeleton with more realistic appearance
function MenuSkeleton() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>

        {[1, 2].map((categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((itemIndex) => (
                <div key={itemIndex} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="h-5 bg-gray-200 rounded w-40"></div>
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
