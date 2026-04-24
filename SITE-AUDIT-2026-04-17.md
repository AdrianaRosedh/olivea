# Olivea — Full Site Audit
**Date:** April 17, 2026
**Scope:** Security, Performance, Correctness, Maintainability, SEO, Accessibility
**Stack:** Next.js 16.1.0 App Router, TypeScript (strict), Tailwind v4, Vercel

---

## Critical Issues (fix before next deploy)

### 1. `<html lang>` is hardcoded to `"es"` for all pages
**File:** `app/layout.tsx:95`
**Impact:** English pages are served with `lang="es"`. Screen readers announce English content in Spanish. Google may misclassify page language.
**Fix:** The root layout doesn't have access to `[lang]` (it's above the route group). Move the `<html lang>` attribute to the group layouts (`app/(main)/[lang]/layout.tsx`, `app/(home)/[lang]/layout.tsx`) or use middleware to set it dynamically.

### 2. Homepage metadata missing `description` and OG image
**File:** `app/(main)/[lang]/metadata.ts:14-23`
**Impact:** `generateMetadata` returns only `title` and `alternates` — no `description`, no `openGraph.description`, no `openGraph.images`. English homepage gets the Spanish fallback description from root layout. Social shares show a generic card.
**Fix:** Add locale-specific `description` and `openGraph` with image to the returned metadata object.

### 3. 132 `"use client"` components — several are unnecessarily client-side
**Impact:** Every `"use client"` component ships its full JS to the browser. Several are purely presentational: `AiSections.tsx`, `Typography.tsx`, `StatChips.tsx`, `FieldNote.tsx`, `SeasonTimeline.tsx`.
**Fix:** Audit each `"use client"` file. Remove the directive from components that don't use hooks, event handlers, or browser APIs. This could meaningfully reduce the client JS bundle.

---

## High Priority (fix this sprint)

### 4. Short-link redirect missing lang prefix
**File:** `app/j/[code]/page.tsx:38`
**Impact:** Invalid codes redirect to `/journal` (no `[lang]` prefix). This will 404 since all journal pages live under `/es/journal` or `/en/journal`.
**Fix:** `redirect("/es/journal")` as the fallback.

### 5. Short-link module-level cache never invalidates
**File:** `app/j/[code]/page.tsx:6`
**Impact:** The `let cached` map is shared across requests in the same server process. New journal posts won't appear in short links until the process restarts.
**Fix:** Use `unstable_cache` with a revalidation interval, or rebuild the map on each request (it's small).

### 6. Rate limiting only applied to 1 of 3 API routes
**Files:** `app/api/banner/route.ts`, `app/olivea-locator/route.ts`
**Impact:** These routes have no rate limiting. The popup route has it. Inconsistent protection.
**Fix:** Apply the same `lib/rate-limit.ts` pattern to banner and locator routes.

### 7. Locator route leaks env var name in error response
**File:** `app/olivea-locator/route.ts:28`
**Impact:** Returns `"Missing NEXT_PUBLIC_GOOGLE_STATIC_MAPS_KEY"` to the client.
**Fix:** Return a generic `500 Internal Server Error` message.

### 8. Team member photos have empty `alt=""` on content images
**Files:** `TeamClient.tsx:240,363`, `TeamDockLeft.tsx:347`, `LinktreeClient.tsx:510,529`, `SharedVideoTransition.tsx:473`
**Impact:** Screen readers skip these images entirely. Team member photos are content images — they need names.
**Fix:** Set `alt={member.name}` or equivalent.

### 9. Form fields lack `htmlFor`/`id` label association
**File:** `app/(main)/[lang]/carreras/contact-form.tsx:69-76`
**Impact:** Labels are not programmatically associated with inputs. No `aria-invalid` or `aria-describedby` on error states.
**Fix:** Add matching `htmlFor`/`id` pairs. Add `aria-invalid={!!error}` and `aria-describedby` pointing to the error message element.

### 10. No skip-to-content link
**Impact:** Keyboard users must tab through the full navbar on every page.
**Fix:** Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` as the first element in the body, and `id="main-content"` on the `<main>` element.

---

## Medium Priority (fix this month)

### 11. CSP uses `'unsafe-inline'` in `script-src`
**Files:** `lib/csp.ts:25`, `proxy.ts:86`
**Impact:** Weakens XSS protection. Any injected script would execute.
**Fix:** Migrate to nonce-based CSP. Generate a per-request nonce in middleware, pass it to Script components.

### 12. Sitemap doesn't filter copy/draft MDX files
**File:** `app/sitemap.ts:51`
**Impact:** The journal loader has `isCopyFile` filtering, but the sitemap generator doesn't use it. Test or draft files could appear in the sitemap.
**Fix:** Apply the same `isCopyFile` filter when generating journal sitemap entries.

### 13. Error page not fully localized
**File:** `app/(main)/[lang]/error.tsx:26-28`
**Impact:** "Something went wrong" and the apology text are hardcoded English. The component already has access to `lang`.
**Fix:** Add Spanish translations using the `lang` parameter.

### 14. `ErrorBoundary.tsx` is dead code
**File:** `components/ui/ErrorBoundary.tsx`
**Impact:** Never imported anywhere.
**Fix:** Either wire it up (wrap client component trees) or delete it.

### 15. Preconnect hints for lazy-loaded widgets waste LCP bandwidth
**File:** `app/layout.tsx:127-129`
**Impact:** Cloudbeds and OpenTable `<link rel="preconnect">` run on every page load, but these widgets only load behind modal clicks.
**Fix:** Remove the Cloudbeds and OpenTable preconnect hints. Keep GTM and GA.

### 16. Framer Motion imports bypass LazyMotion
**Impact:** Many components import `motion.div` directly from `"framer-motion"` instead of using the `m` API through `LazyMotion`. This defeats the code-splitting that `LazyMotion + domAnimation` provides.
**Fix:** Replace `import { motion } from "framer-motion"` with `import { m } from "framer-motion"` in components wrapped by `LazyMotion`.

### 17. Navbar `<nav>` lacks `aria-label`
**File:** `components/layout/Navbar.tsx:229`
**Impact:** Multiple `<nav>` elements exist (header, footer, mobile). Screen readers can't distinguish them.
**Fix:** Add `aria-label="Main navigation"` / `aria-label="Footer navigation"` respectively.

### 18. ReservationModal uses wrong ARIA pattern for tabs
**File:** `components/forms/reservation/ReservationModal.tsx:593`
**Impact:** Tab buttons use `aria-current="page"` instead of `role="tablist"` / `role="tab"` / `aria-selected`.
**Fix:** Implement proper WAI-ARIA tabs pattern.

### 19. NavSub/NavSection types duplicated across 7 files
**Files:** `sections.en.ts` / `sections.es.ts` in cafe, casa, carreras, farmtotable, etc.
**Impact:** Type drift risk. Same interfaces defined independently in each file.
**Fix:** Extract to `types/nav.ts` and import everywhere.

### 20. Possible low color contrast: olive on cream
**Colors:** `#5e7658` on `#e7eae1` (≈3.0:1 ratio)
**Impact:** Fails WCAG AA for normal text (requires 4.5:1).
**Fix:** Verify rendered contrast. If confirmed, darken the olive to at least `#4a5f44` for 4.5:1 compliance.

---

## Low Priority (backlog)

### 21. `lib/seoConfig.ts` appears to be dead code (next-seo, Pages Router era)
### 22. RSS feed missing `atom:link rel="self"` reference
### 23. No `X-Frame-Options: DENY` fallback header for older browsers
### 24. Add rate limiting to `carreras` server action
### 25. Rename `author.ts` / `authors.ts` to reduce confusion (e.g., `authorNormalizer.ts` / `authorResolver.ts`)
### 26. `react-icons/fa` barrel import in Footer — consider `lucide-react` or individual imports
### 27. SVG in `AlebrijeDraw.tsx` uses `dangerouslySetInnerHTML` — add a comment confirming source is trusted

---

## What's Already Good

- **TypeScript discipline:** `strict: true`, `noImplicitAny`, `noUnusedLocals`, zero `@ts-ignore` or `as any` casts. Exemplary.
- **Image pipeline:** AVIF + WebP, proper `sizes` props, `priority` on LCP images, `unoptimized: false`.
- **Structured data:** Complete JSON-LD graph — Restaurant, LodgingBusiness, CafeOrCoffeeShop, Organization, WebSite with correct cross-references.
- **Security headers:** HSTS, nosniff, strict referrer, restrictive permissions policy, `poweredByHeader: false`.
- **Form security:** Careers form has Zod validation, honeypot, timing check, Turnstile CAPTCHA, HTML escaping.
- **Font loading:** Proper `display: "swap"`, hero font preloaded, secondary fonts deferred.
- **Static generation:** `generateStaticParams` on all dynamic routes, ISR with 60s revalidation on journal.
- **Dynamic imports:** Heavy widgets (Cloudbeds, OpenTable, LiveGarden, video transitions) properly lazy-loaded with `ssr: false`.
- **Focus trapping:** Modals and drawers use `focus-trap-react` and custom `useFocusTrap` with proper escape handling and focus restoration.
- **MDX rendering:** Build-time compilation from trusted content, no `dangerouslySetInnerHTML` for user-facing content. Zod-validated frontmatter.
