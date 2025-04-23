import { getDictionary } from '../dictionaries'
import { Home, Coffee, Star, MapPin } from 'lucide-react'

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'es' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <main className="scroll-container snap-y snap-mandatory h-full overflow-y-scroll scroll-smooth">
      <section
        id="rooms"
        className="h-screen w-full snap-start flex items-center justify-center px-6"
      >
        <div>
          <h2 className="text-2xl font-semibold">{dict.casa.sections.rooms.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.rooms.description}</p>
        </div>
      </section>

      <section
        id="breakfast"
        className="h-screen w-full snap-start flex items-center justify-center px-6"
      >
        <div>
          <h2 className="text-2xl font-semibold">{dict.casa.sections.breakfast.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.breakfast.description}</p>
        </div>
      </section>

      <section
        id="experiences"
        className="h-screen w-full snap-start flex items-center justify-center px-6"
      >
        <div>
          <h2 className="text-2xl font-semibold">{dict.casa.sections.experiences.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.experiences.description}</p>
        </div>
      </section>

      <section
        id="location"
        className="h-screen w-full snap-start flex items-center justify-center px-6"
      >
        <div>
          <h2 className="text-2xl font-semibold">{dict.casa.sections.location.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.location.description}</p>
        </div>
      </section>
    </main>
  )
}