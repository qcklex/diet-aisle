# DietAisle — Development Phases Checklist

Standard web-app lifecycle mapped to this project. Tick items as they complete; the current phase is the first one with unticked boxes that block the next.

## Phase 1 — Discovery & definition ✅ COMPLETE

- [x] Problem defined: weekly meal planning + UK supermarket price comparison
- [x] Target users defined (structured dieters + fitness people)
- [x] Requirements written (`REQUIREMENTS.md`)
- [x] Architecture constraints chosen (no build step, Edge Function proxy, localStorage-first)

## Phase 2 — Design & architecture ✅ COMPLETE

- [x] Visual design system (`STYLEGUIDE.md`)
- [x] Stack: Vue 3 CDN single-file, Vercel Edge Functions, Supabase, PWA
- [x] Data flow designed (receipt → Claude Vision → OFF → USDA → Claude estimation → product DB)
- [x] Security model: Claude API key server-side only

## Phase 3 — MVP build ✅ COMPLETE

- [x] Preset meal plans + manual add/remove
- [x] AI meal plan generation with macro targets
- [x] Shopping list with per-store price comparison + split-shop
- [x] Receipt scanning with nutrition-matching pipeline
- [x] Local product database
- [x] Installable PWA with offline shell

## Phase 4 — Feature expansion 🟡 PARTIAL (3/8 — remaining items are optional scope)

- [x] Barcode scanning (camera + manual, Open Food Facts)
- [x] Accounts + Supabase cloud sync
- [x] Dashboard home tab
- [ ] Community product database *(scope decision pending)*
- [ ] Predictive restock calendar *(scope decision pending)*
- [ ] Lidl/Aldi weekly specials *(scope decision pending)*
- [ ] One-tap Tesco/Ocado export *(scope decision pending)*
- [ ] Pantry tracking *(scope decision pending)*

## Phase 5 — Production hardening ✅ COMPLETE (as of v18, 2026-07-08)

- [x] All known user-visible bugs fixed (scan-tab render bug, dead House tab)
- [x] Full rebrand — no keto branding in UI, storage keys, or SW cache (with data migration)
- [x] Privacy disclosures accurate (Overpass geolocation)
- [x] Production API keys (USDA registered key, 3,600 req/hr)
- [x] Network error handling: inline errors, offline guards, no frozen spinners, no silent failures
- [x] JS syntax validation workflow before every deploy
- [x] Release log (`CHANGELOG.md`) established

## Phase 5b — "Quiet Ledger" UI redesign ✅ COMPLETE (2026-07-08, v19–v22)

- [x] Design system created and approved (DESIGN.md) — modern minimalist, Geist + Geist Mono, one green accent
- [x] Foundation reskin applied (tokens, fonts, light header)
- [x] GPS "cheapest near you" verdict card on Shop tab
- [x] Restock cadence chips in the shopping list
- [x] Desktop two-panel layout ≥1024px
- [x] Dark mode with header toggle

## Phase 5c — WCAG 2.2 AA compliance ✅ COMPLETE (2026-07-09, v23–v24)

- [x] axe-core audit (WCAG 2.0/2.1/2.2 AA) — 0 violations across all 7 tabs × light/dark × modal, verified on production
- [x] Contrast fixes, focus-visible outlines, reduced-motion support, dialog/live-region semantics, 24px targets

## Phase 6 — Pre-launch 🔶 ← **WE ARE HERE**

- [x] First-run onboarding / empty states reviewed for a user with zero data (v25)
- [ ] Custom domain: register **dietaisle.com** (~$9/yr on Cloudflare) and connect to Vercel
- [ ] Real-device QA pass on iPhone (iOS Safari PWA) — install, offline, camera flows
- [ ] Basic analytics (privacy-respecting, e.g. Vercel Analytics) to show funders traction
- [ ] Privacy policy page (needed once real users sign up + for funders)
- [ ] 3–5 real test users run a full week's flow, feedback collected
- [ ] Funder demo script + screenshots (Scottish EDGE, SMART Scotland, Techscaler briefs are drafted)

## Phase 7 — Launch ⬜ NOT STARTED

- [ ] Public announcement / listing (Product Hunt, r/mealprep, UK fitness communities)
- [ ] App store presence decision (PWA-only vs wrapping for App Store)
- [ ] Support channel (email or form)
- [ ] Monitor: error rates, Claude API spend, Supabase usage

## Phase 8 — Growth & iteration ⬜ NOT STARTED

- [ ] Pick Phase-4 leftovers based on real user feedback
- [ ] Phase 3 roadmap items (profiles, social sharing, trends, Apple Health, budget optimiser)
- [ ] Pricing/monetisation decision (Claude API costs money per REQUIREMENTS §7)
- [ ] Corporate structure: product sits under the umbrella Ltd (in registration)
