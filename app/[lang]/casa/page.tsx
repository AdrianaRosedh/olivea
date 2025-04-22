import { getDictionary } from '../dictionaries'
import { FloatingDock } from '@/components/ui/floating-dock-vertical'
import {
  Home,
  Coffee,
  Star,
  MapPin,
} from 'lucide-react' // or your preferred icons

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'es' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const dockItems = [
    { title: dict.casa.sections.rooms.title, icon: <Home />, href: "#rooms" },
    { title: dict.casa.sections.breakfast.title, icon: <Coffee />, href: "#breakfast" },
    { title: dict.casa.sections.experiences.title, icon: <Star />, href: "#experiences" },
    { title: dict.casa.sections.location.title, icon: <MapPin />, href: "#location" },
  ]

  return (
    <div className="relative">
      <FloatingDock items={dockItems} />

      <main className="px-4 md:px-12 max-w-5xl mx-auto space-y-24 py-24">
        <section id="rooms">
          <h2 className="text-2xl font-semibold">{dict.casa.sections.rooms.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.rooms.description}</p>
        </section>

        <section id="breakfast">
          <h2 className="text-2xl font-semibold">{dict.casa.sections.breakfast.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.breakfast.description}</p>
        </section>

        <section id="experiences">
          <h2 className="text-2xl font-semibold">{dict.casa.sections.experiences.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.experiences.description}</p>
        </section>

        <section id="location">
          <h2 className="text-2xl font-semibold">{dict.casa.sections.location.title}</h2>
          <p className="mt-2 text-muted-foreground">{dict.casa.sections.location.description}</p>
        </section>
      </main>
    </div>
  )
}