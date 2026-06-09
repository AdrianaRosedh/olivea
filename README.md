# OLIVEA — Frontend Application

A high-performance, bilingual (ES/EN) hospitality web platform powering **Olivea Farm To Table**, **Casa Olivea**, and **Olivea Café**.

Built with **Next.js 16 + React 19**, server components, MDX content, advanced Framer Motion animations, shared video transitions, and Turbopack (the Next 16 default bundler).

This repository contains the complete frontend of the Olivea digital experience — fast, secure, multilingual, animation-driven, and deeply optimized for mobile.

> **Node version:** This project targets **Node 20** (see `"engines"` in `package.json`).  
> Use Node 20.x locally for consistent behavior with production.

---

## 🚀 Tech Stack

**Frameworks & Languages**

- Next.js 16 (App Router)
- React 19 (Server Actions & RSC)
- TypeScript
- MDX for page content

**UI & Styling**

- Tailwind CSS v4
- Framer Motion 12
- GSAP (scroll effects)
- Custom shared-video transition engine (RSC + client)

**Content & Data**

- MDX content system for bilingual pages
- Local static assets (videos, imagery)

**Build & Deployment**

- Turbopack (Next 16 default — the MDX setup is deliberately Turbopack-compatible: no plugin options in `next.config.ts`)
- pnpm 10 (`packageManager` field; do not commit a `package-lock.json`)
- Deployed on Vercel
- Strict CSP & performance headers

---

## 🌐 Features

### 1. Bilingual Routing (ES/EN)

- Language detected via cookie → Accept-Language → fallback to `es`
- Middleware (`proxy.ts`) enforces `/en/...` or `/es/...`
- Automatic redirects
- Proper `alternate` SEO metadata per language

### 2. Animation-Rich Experience

- Shared Video Transition between pages
- Dynamic client-side animations (Framer Motion)
- Scroll-linked effects (GSAP)
- Smooth blend between LCP image and background video on Homepage

### 3. MDX-Driven Content System

Each page (Casa, Café, Farm To Table) loads content from:

```txt
app/(main)/[lang]/<section>/ContentEs.tsx → *.es.mdx
app/(main)/[lang]/<section>/ContentEn.tsx → *.en.mdx
````

This enables:

* Rich text
* Translated content
* Sections rendered as isolated MDX components

### 5. CSP & Security

The `proxy.ts` middleware applies:

* Strict Content Security Policy
* HTTPS enforcement (HSTS)
* Permissions Policy (disable camera/mic/etc.)
* Referrer, X-Content-Type-Options, nosniff

Special CSP rules are applied to:

* Cloudbeds immersive booking
* OpenTable widgets
* Image/CDN providers

### 6. Performance Engineering

* `next build` (Turbopack, Next 16 default)
* `optimizePackageImports`, tree-shaking
* Lazy loaded components
* Preloading strategies (hero image → background video)
* Static generation for most pages
* Server components for optimal hydration

---

## 📁 Project Structure

```txt
olivea/
│
├── app/
│   ├── (home)/[lang]/          # Homepage per language
│   ├── (main)/[lang]/          # Main sections (casa, cafe, farmtotable, etc.)
│   ├── sitemap.xml/            # Static XML via RSC
│   └── robots.txt/             # Robots policy
│
├── components/
│   ├── layout/                 # LayoutShell, DockLeft/DockRight, scroll system
│   ├── navigation/             # Navbar, MobileDrawer
│   ├── transitions/            # Shared video transition engine
│   ├── home/                   # Homepage sections
│   └── forms/                  # Reservation modal, CTA forms
│
├── contexts/
│   ├── NavigationContext.tsx
│   ├── ReservationContext.tsx
│   └── SharedVideoTransitionContext.tsx
│
├── hooks/
│   ├── useIsMobile.ts
│   ├── usePrefersReducedMotion.ts
│   └── useScrollLock.ts
│
├── lib/
│   ├── i18n/                   # Dict loader, schemas
│   ├── performance/            # LCP watcher, video preloaders
│   └── utils.ts
│
├── public/
│   ├── images/
│   ├── videos/
│   └── icons/
│
├── app/globals.css             # Design tokens + Tailwind v4 entry (CSS-first, no tailwind.config)
│
├── vercel.json                 # Cache headers + build command
├── next.config.ts              # MDX, CSP headers, rewrites
└── proxy.ts                    # Security & locale middleware
```

---

## ⚙️ Environment Variables

This project requires the following variables (configured in Vercel; values live in `.env.local` for development — never commit them):

```bash
NEXT_PUBLIC_SITE_URL=          # https://oliveafarmtotable.com
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon (public) key
SUPABASE_SERVICE_ROLE_KEY=     # server-only — admin mutations
RESEND_API_KEY=                # magic-link auth emails
ADMIN_AUTH_BYPASS=             # dev-only mock admin session; never set in prod
```

---

## 🧩 Running Locally

This project uses **pnpm 10** (see `packageManager` in `package.json`) and **Node 20**.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run Dev Server

```bash
pnpm dev
```

The dev script binds to `olivea-localhost:3000` (add `127.0.0.1 olivea-localhost` to `/etc/hosts`).

### 3. Production build

```bash
pnpm build
```

You should see `Next.js 16.x (Turbopack)`. The MDX setup in `next.config.ts` is intentionally Turbopack-compatible — keep remark/rehype plugins out of `createMDX` (they belong to `next-mdx-remote`, which configures its own pipeline).

### 4. Start Production

```bash
pnpm start
```

---

## 🛡️ Deployment (Vercel)

This app is deployed on Vercel using the default Next.js adapter with a custom `vercel.json`.

Deployment details:

* `vercel.json` → custom cache headers + build command
* pnpm detected automatically via `packageManager` / `pnpm-lock.yaml`
* Long-term caching for static assets

---

## 🔐 Security & CSP

Middleware (`proxy.ts`) applies:

* `Content-Security-Policy`
* `X-Content-Type-Options`: nosniff
* `Referrer-Policy`: strict-origin-when-cross-origin
* `Permissions-Policy`: camera=(), microphone=(), etc.
* HSTS for production

Custom CSP exceptions for:

* Cloudbeds
* OpenTable
* Google services
* Unsplash

---

## 💡 Development Notes

### MDX Layout

* Used for all content pages
* Keep `.es.mdx` and `.en.mdx` paired
* MDX components allow interactive content

### Shared Video Transition

A custom system using:

* React context
* React portals
* Framer Motion
* Video overlays
* Scroll & state synchronization

### Animations

* Keep GSAP usage minimal to prevent overloading the bundle
* Prefer Framer Motion for layout & transitions
* Use `prefers-reduced-motion` fallbacks everywhere

---

## 🧪 Testing (Recommended)

Coming soon. Suggested future additions:

* Playwright for full-page rendering
* Snapshot tests for MDX pages
* Integration tests for language routing (`/ → /es`, etc.)

---

## 📄 License

Internal project — not licensed for public use or redistribution.

---

## 🙌 Author

Designed & developed by **Adriana Rose**.