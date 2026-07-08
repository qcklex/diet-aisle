# DietAisle — Changelog

Work log for every release. Newest first. The SW cache version (`sw.js`) is the release number — bump it whenever `index.html` changes.

## v20 — 2026-07-08 · Redesign increment 2: GPS "cheapest near you" verdict card

- New verdict card leads the Shop tab: "Cheapest for your list · near you" — winner store + basket total, green savings line vs the priciest nearby option, then per-store rows (price bar, mono price, distance), one row per brand at its nearest branch.
- Reuses the existing Overpass locator + `nearbyWithPrices` merge; on-demand geolocation only (button tap), matching the app's no-tracking privacy promise.
- Without an AI plan it ranks nearby stores by distance and prompts "Generate an AI plan to rank these stores by basket price" — no dead states.
- Requested by Alex 2026-07-08 ("track with GPS which supermarket is cheaper for your current shopping list").

## v19 — 2026-07-08 · "Quiet Ledger" redesign, increment 1 of 5 (foundation)

- New design system applied via token swap + override layer (see DESIGN.md, approved via design consultation after rejecting a bolder "receipt-punk" v1 as too cartoonish).
- Geist + Geist Mono loaded from Google Fonts; all macro/price numbers now tabular mono.
- Dark-green header chrome replaced with a minimal light header; preset/day pills get quiet outlines with green-soft active states.
- Warm near-white background `#FAFAF8`, hairline borders `#E8E8E3`, soft card shadows; accent green `#047857` (green now means progress/savings only); blue info tags neutralised.
- Remaining increments: GPS store-verdict hero card, restock chips, desktop two-panel, dark mode toggle.

## v18 — 2026-07-08 · Network error-handling pass

- Receipt scan and AI plan failures now show friendly inline error boxes instead of raw `alert()` dialogs.
- Both flows check `navigator.onLine` up front and say clearly when you're offline instead of failing with "Failed to fetch".
- `claudeCall()` maps network-level fetch failures to a friendly message (offline vs server unreachable) for all callers.
- AI plan that streams back without parseable JSON now reports an error instead of silently showing nothing.
- Audited all other network flows (barcode, store locator, auth, cloud sync, nutrition matching) — already had inline errors, loading states, and `finally` cleanup; no frozen-spinner paths found.

## v17 — 2026-07-08

- Replaced the USDA FoodData Central `DEMO_KEY` with a registered api.data.gov key (3,600 req/hr vs 30/hr) — the nutrition-matching pipeline's USDA tier no longer rate-limits during normal use. Key lives in the `USDA_API_KEY` constant; account is qcklexdev@gmail.com. (`aa2cc8d`)

## v16 — 2026-07-07

- Renamed the "Keto 3-Day Shop" heading to "Batch-Cook 3-Day Shop" — last user-visible keto branding, caught during live post-deploy verification. (`4390659`)

## v15 — 2026-07-07 · Final-version polish pass (pre-funder-demo)

- Renamed the "📋 Keto Shop" tab to "📋 Batch Shop" (internal id `ketolist` → `batchlist`).
- Renamed all `keto_*` localStorage keys to `da_*`, with a one-time migration in `load()` (existing users keep their data) and legacy-key mapping in `applyState()` (old Supabase cloud snapshots still sync). Do not remove that mapping — pre-rebrand snapshots persist in the `app_state` table.
- Hoisted the USDA API key into the `USDA_API_KEY` constant. (`a787826`)

## v14 — 2026-07-07

- Fixed the scan-tab Vue 3 bug: `v-if` + `v-for` on the same element (Vue 3 gives `v-if` priority, so `item` was out of scope) — skip-filter moved into a `visibleScanItems` computed.
- Removed the dead "🏠 House" nav tab (button existed with no content block — tapping it showed a blank page).
- Disclosed that "Find stores near me" sends coordinates to the Overpass API, in the UI copy and REQUIREMENTS.md's privacy section. (`efc35ba`)

## v11–v13 — 2026-06-11 · Phase 2: scanning, accounts, dashboard

- Barcode scanning (camera via BarcodeDetector with manual-entry fallback) with Open Food Facts nutrition lookup. (`7261b22`)
- Accounts + Supabase cloud sync: email/password and magic-link sign-in, RLS, debounced auto-push, last-write-wins pull. localStorage stays the primary store; cloud is an optional layer. (`0113370`, `068c4ee`)
- Dashboard home tab: today's macros vs goals, weekly shop cost, product DB stats, quick actions. (`0113370`)

## v9–v10 — 2026-06-08/10

- Nearby supermarket locator (Overpass API) with time/money comparison. (`cb6e90a`)
- Brief and target users expanded to include fitness people. (`7d690ba`)
- Intermittent Fasting preset tuned to 1742 kcal · 186P/98F/29C, meal-prep rotation; IF shop tab synced. (`f48dd28`–`804eb2d`)

## v6–v8 — 2026-06-07

- Intermittent Fasting preset (A/B/C 7-day rotation). (`2be964e`)
- Weekly menu moved into per-day tabs; batch-cook shopping list tab added. (`853a4a2`, `53a74b9`)
- Fixed ASDA preset syntax error that broke JS parsing. (`0315758`)

## v3–v5 — 2026-05-20

- Bulking Phase preset (rice & pasta meals, air-fryer proteins, own shopping list). (`00a4bfb`–`33a06dd`)
- ASDA Alternating meal plan (Day A/B). (`25c6c07`)

## v1–v2 — 2026-05-03/04 · Foundation

- AI receipt scanning, nutrition-matching pipeline (Open Food Facts → USDA → Claude estimation), AI meal-plan generation. (`38b2578`)
- Per-store price comparison and shopping optimiser (incl. split-shop). (`96be96a`)
- Server-side Claude proxy (Vercel Edge Function) — API key never reaches the browser. (`688af6d`)
- Rebranded keto-app → DietAisle. (`51c3e82`)
- Fixed silent JS syntax error breaking Vue mount; fixed iOS file picker (`capture=` attribute removed). (`a99d51a`)
