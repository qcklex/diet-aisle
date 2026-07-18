# Prompt: DietAisle — Final Version

Copy everything below the line into a fresh Claude Code session started from `/Users/alex/DietAisle/`.

---

Develop the **final, production-ready version** of DietAisle — my Vue 3 PWA for AI meal planning + UK supermarket price comparison, live at https://dietaisle.vercel.app. This version needs to be polished enough to demo to funders (Scottish EDGE, SMART Scotland, Techscaler) and to hand to real users.

## Before writing any code

1. Read `REQUIREMENTS.md` and `STYLEGUIDE.md` in full — they are the source of truth for features and visual design.
2. Read `index.html` (the entire app, ~2,460 lines), `api-routes/chat.js`, `sw.js`, `manifest.json`, `vercel.json`, and `supabase-setup.sql` to understand the current state.
3. Then give me a gap analysis: for every feature in REQUIREMENTS.md, mark it ✅ complete, 🟡 partial, or ❌ missing — and list anything broken. Wait for my sign-off on the work list before implementing.

## Architecture constraints (do not change these)

- Vue 3 via CDN (`vue.min.js`), **no build step** — everything stays in the single `index.html`.
- Claude API calls go only through the Vercel Edge Function at `api-routes/chat.js`; the API key must never reach the browser.
- localStorage is the primary data store; Supabase is the optional cloud-sync layer on top.
- Mobile-first: I use the app on an iPhone (iOS Safari PWA). Every feature must work there — no `capture=` attributes on file inputs (breaks the photo-library option), no APIs without an iOS fallback (e.g. BarcodeDetector already falls back to manual entry).

## Definition of "final"

- Every Core Feature in REQUIREMENTS.md works end-to-end: meal planning, AI shopping list, store price comparison (incl. split-shop), receipt scanning with the nutrition-matching pipeline, product database, barcode scanning, accounts & Supabase cloud sync, dashboard.
- Robust error handling everywhere the app talks to a network (Claude proxy, Open Food Facts, USDA, Supabase): loading states, friendly error messages, retry where sensible — never a silent failure or frozen spinner.
- Offline behaviour is sane: the service worker serves the app shell offline, and features that need the network say so clearly instead of breaking.
- PWA installability is clean: correct icons, manifest, and a bumped service-worker cache version (`sw.js`) with every release.
- Visual polish per STYLEGUIDE.md: consistent spacing, typography, empty states, and onboarding for a first-time user who has no data yet.
- No dead code, no console errors, no leftover keto-app branding anywhere.

## Workflow rules

- After every edit to the inline JS in `index.html`, extract the script and run `node --check` on it before considering the change done (a stray brace once broke Vue mounting with zero console errors).
- Commit in small, atomic commits with clear messages. Stage specific files only — **never `git add -A`**, and never commit `node_modules`, `.env`, or `api/keto.json`.
- Bump the service-worker cache version in `sw.js` whenever `index.html` changes.
- Deploy with `npx vercel --prod`, then immediately re-alias: `npx vercel alias set <deployment-url> dietaisle.vercel.app` (the CLI auto-aliases to the old keto-lidl name otherwise).
- After deploying, verify the live site actually loads and Vue mounts (check that `{{ }}` templates are rendered, not raw).
- After the work is done, sync the Desktop mirror: copy `index.html`, `manifest.json`, `vercel.json`, `sw.js`, `api-routes/`, and docs to `/Users/alex/Desktop/A1. PROJECTS TO DO  - PROGRAMING /0.  MAIN PROJECT/DietAisle/`.
- Finish by updating `REQUIREMENTS.md` status to reflect what shipped, and give me a short release summary I can reuse in funding applications.

Work through the agreed list feature by feature — implement, validate, commit, then move to the next. Deploy once at the end unless I ask for an interim deploy.
