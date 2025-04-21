import "@/app/globals.css"
import { Inter } from "next/font/google"
import LayoutShell from "@/components/LayoutShell"

const inter = Inter({ subsets: ["latin"] })

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: "en" | "es" }>
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <LayoutShell lang={lang}>{children}</LayoutShell>
      </body>
    </html>
  )
}