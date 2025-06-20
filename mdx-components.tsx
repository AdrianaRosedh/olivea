// mdx-components.tsx
'use client'

import { MDXProvider } from '@mdx-js/react'
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from '@/components/ui/Typography'

export const components = {
  h1: (props: React.ComponentProps<typeof TypographyH1>) => (
    <TypographyH1 {...props} />
  ),
  h2: (props: React.ComponentProps<typeof TypographyH2>) => (
    <TypographyH2 {...props} />
  ),
  p: (props: React.ComponentProps<typeof TypographyP>) => (
    <TypographyP {...props} />
  ),
  // etc…
}

export function MDXWrapper({ children }: React.PropsWithChildren) {
  return <MDXProvider components={components}>{children}</MDXProvider>
}
