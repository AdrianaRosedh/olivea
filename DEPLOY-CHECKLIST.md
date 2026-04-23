# Deploy Checklist: Olivea Code Review Fixes

**Release:** Security & UX hardening (43 findings resolved)
**Date:** April 23, 2026
**Branch:** `main`
**Platform:** Vercel (Next.js 16.1.0) + Supabase
**Deployer:** _______________

---

## Pre-Deploy

### Code Readiness

- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit` — **verified clean**)
- [ ] All changes committed and pushed to `main`
- [ ] No `.env`, credentials, or secrets in the diff
- [ ] 97 files modified — reviewed the full diff for unintended changes

### Security Fixes (Critical — verify these work)

- [ ] **Open redirect fix** — visit `/admin/auth/callback?redirect=https://evil.com` → should redirect to `/admin`, NOT to evil.com
- [ ] **Open redirect fix** — visit `/admin/login?redirect=//evil.com` → should redirect to `/admin`
- [ ] **XSS sanitization** — journal articles with `<script>` tags in `htmlBody` should render with scripts stripped
- [ ] **Storage auth** — unauthenticated POST to image upload endpoint returns 401/403
- [ ] **Careers form validation** — submit with empty name or invalid email → should be rejected server-side

### Environment Variables (Vercel Dashboard)

Confirm all of these are set in **Production** environment:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — server-only service role key
- [ ] `RESEND_API_KEY` — for transactional emails (magic link, etc.)
- [ ] `NEXTAUTH_SECRET` or equivalent session secret (if used)

### Supabase

- [ ] All tables exist (run `list_tables` or check Dashboard)
- [ ] RLS policies are in place: public read on content tables, service_role write
- [ ] `admin_users` table has at least one owner row (`adriana@casaolivea.com`)
- [ ] Auth redirect URLs include your production domain (`https://olivea.com/admin/auth/callback`)
- [ ] Storage bucket `media` exists with appropriate policies

---

## Deploy

### Vercel Deployment

- [ ] Push to `main` (or trigger deploy from Vercel Dashboard)
- [ ] Vercel build succeeds — check build logs for errors
- [ ] No `WARN` or `ERROR` in build output related to missing env vars
- [ ] Preview deployment URL works (Vercel auto-generates one)

### Smoke Tests — Public Site

- [ ] Homepage loads with hero video (`/es` and `/en`)
- [ ] Language toggle works (ES ↔ EN) on all pages
- [ ] Farm to Table page renders menu content from Supabase
- [ ] Casa page renders with FAQ section
- [ ] Café page loads
- [ ] Journal listing page shows articles
- [ ] Journal article detail page renders content (no raw HTML visible)
- [ ] Careers page shows job openings
- [ ] Contact form submits without error
- [ ] Press page renders description paragraphs
- [ ] Footer and navigation drawer display correctly
- [ ] Mobile viewport renders correctly (no layout breaks)

### Smoke Tests — Admin Portal

- [ ] `/admin/login` loads the login page
- [ ] Magic link login flow works end-to-end
- [ ] Admin dashboard loads with correct stats
- [ ] Command palette opens with `⌘K` / `Ctrl+K`
- [ ] Search finds pages (type "café" → shows Café page)
- [ ] Visual page editor loads (try Farm to Table)
- [ ] Edit a text field → "Unsaved changes" appears → Save → "Changes saved" toast
- [ ] Discard button restores original content
- [ ] Journal editor opens, save/publish/unpublish work
- [ ] Hours editor saves successfully with success toast
- [ ] Homepage hero video editor shows error toast on failure (disconnect network to test)
- [ ] Banners editor shows error toast on save failure
- [ ] Media library loads and displays images
- [ ] Profile panel opens from dock avatar
- [ ] Profile avatar upload works
- [ ] Team management page loads (owner only)
- [ ] `beforeunload` warning fires when navigating away with unsaved changes
- [ ] Read-only users see "Read-only" message in editor toolbar

---

## Post-Deploy

### Monitoring (first 30 minutes)

- [ ] Vercel Analytics — no spike in error rate
- [ ] Vercel Functions — check for runtime errors in logs
- [ ] Supabase Dashboard — no unusual query patterns or errors
- [ ] Google Search Console — no new crawl errors (check after 24h)

### SEO Verification

- [ ] `<html lang>` attribute matches URL path (`/es` → `lang="es"`, `/en` → `lang="en"`)
- [ ] Open Graph meta tags render correctly (use [ogp.me](https://ogp.me) or social debugger)
- [ ] `hreflang` alternates present in page source (`es-MX`, `en-US`)
- [ ] Structured data (JSON-LD) present — SiteNavigationElement on all pages

### Stakeholder Notification

- [ ] Notify team that deploy is live
- [ ] Note any changed admin workflows (command palette is new)

---

## Rollback Plan

**Trigger rollback if any of these occur:**

- Build fails on Vercel → automatic (previous deployment stays live)
- Auth/login completely broken → redeploy previous commit via Vercel Dashboard
- Public site pages return 500 errors → instant rollback in Vercel Deployments tab
- Content editors cannot save → check Supabase service role key, rollback if env var issue

**How to rollback:**

1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "..." → "Promote to Production"
4. Verify the rollback worked

**No database migrations in this release** — all Supabase tables and content were migrated in prior sessions and are already live. This release only changes application code (security fixes, UX improvements, accessibility). Rollback is a pure code revert with zero data risk.

### Verify Existing Supabase Tables Are Intact

These tables were created and seeded in earlier sessions. Confirm they still have data before deploying:

- [ ] `farmtotable_content`, `casa_content`, `cafe_content`, `contact_content` — page content
- [ ] `sustainability_content`, `press_content`, `legal_content`, `team_content`, `not_found_content` — page content
- [ ] `home_content`, `global_settings`, `drawer_content`, `footer_content` — site-wide config
- [ ] `hero_videos` — at least one row with `active = true`
- [ ] `casa_faq` — FAQ items with `sort_order`
- [ ] `careers_content` — careers page content
- [ ] `job_openings` — job listings
- [ ] `applications` — applicant pipeline
- [ ] `popups`, `banners` — promotional content
- [ ] `admin_users` — at least `adriana@casaolivea.com` with role `owner`
- [ ] `journal_posts` — articles with status `published`
- [ ] `sustainability_sections` — sustainability page sections

---

## Changes in This Release

### Critical (2)
1. Fixed open redirect in `/admin/auth/callback` and `/admin/login` — redirect param now validated to start with `/admin`
2. Fixed XSS in journal article rendering — `dangerouslySetInnerHTML` now sanitized via `sanitizeHtml()`

### High (8)
3. Added auth guards to `uploadImage` and `deleteImage` storage actions
4. Added server-side input validation to careers application submission
5. Fixed `setActiveVideo` error handling with try/catch and rollback awareness
6. Added `crypto.randomUUID()` for collision-safe IDs in hours editor
7. Added optimistic update rollback in journal save/publish/unpublish
8. Added error toast display in hours, homepage, and banners editors
9. Fixed `structuredClone` replacing `JSON.parse(JSON.stringify())` in visual editor
10. Optimized dirty-state tracking with `useEffect`-based comparison

### Medium (15)
11. Added `beforeunload` warning for unsaved changes in visual editor
12. Fixed unstable list keys in press editor
13. Memoized context values in `AuthProvider` and `AdminDockContext` with `useMemo`
14. Fixed ProfilePanel hydration mismatch (replaced `typeof document` check)
15. Fixed CommandPalette mutable `itemIndex` (concurrent-mode safe)
16. Added `aria-modal` and `role="dialog"` to CommandPalette
17. Fixed `metadata.ts` params to use Promise-based contract (Next.js 16)
18. Added error state display in homepage video editor
19. Added error state display in banners editor
20–25. Various type safety and error handling improvements

### Low (12) + Info (6)
26–43. Code quality improvements, documentation, and minor fixes
