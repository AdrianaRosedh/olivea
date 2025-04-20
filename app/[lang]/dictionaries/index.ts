type Locale = 'en' | 'es'

type Dictionary = {
  about: { title: string; description: string }
  cafe: { title: string; description: string; error: string }
  casa: { title: string; description: string }
  contact: { title: string; description: string }
  events: { title: string; description: string }
  journal: {
    title: string
    subtitle: string
    loading: string
    empty: string
    error: string
    by?: string
  }
  legal: { title: string; description: string }
  reservations: { title: string; description: string }
  restaurant: { title: string; description: string }
  notFound?: { message: string; cta: string }
  home?: { title: string; subtitle: string; cta_restaurant: string; cta_casa: string }
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./en.json').then((module) => module.default),
  es: () => import('./es.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const loader = dictionaries[locale]
  return loader()
}