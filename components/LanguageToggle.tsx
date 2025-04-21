'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setCookie } from 'cookies-next'

const locales = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export function LanguageToggle() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: string) => {
    if (!pathname) return

    const segments = pathname.split('/')
    segments[1] = newLocale // Replace the [lang] segment
    const newPath = segments.join('/')

    setCookie('NEXT_LOCALE', newLocale, { path: '/' })

    startTransition(() => {
      router.push(newPath)
    })
  }

  return (
    <select
      className="px-2 py-1 border rounded bg-white text-black"
      defaultValue={pathname?.split('/')[1]}
      onChange={(e) => handleLocaleChange(e.target.value)}
      disabled={isPending}
    >
      {locales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.label}
        </option>
      ))}
    </select>
  )
}