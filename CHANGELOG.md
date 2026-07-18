# DietAisle — Changelog

Work log for every release. Newest first. The SW cache version (`sw.js`) is the release number — bump it whenever `index.html` changes.

## v33 — 2026-07-18 · Privacy policy page + Vercel Web Analytics

- **Privacy policy page** (`privacy.html`, clean URL `/privacy` via vercel.json rewrite) — Phase 6 item. Quiet Ledger-styled plain-English policy covering exactly what the code does: localStorage-first storage, Supabase account/sync, receipt photos → Claude API via our proxy, barcode → Open Food Facts + Open Prices, food names → USDA, one-shot Overpass geolocation, Vercel hosting/analytics, Google Fonts + jsDelivr CDN requests, UK GDPR rights with deletion by email (no in-app account deletion exists — the policy doesn't claim one). Linked from the landing footer (the old link pointed at #faq) and a new "Privacy policy" link under the sign-in gate card.
- **Vercel Web Analytics (partial)** — Phase 6 item. `/_vercel/insights/script.js` now loaded (defer) by index.html, landing.html and privacy.html; cookieless/aggregate, disclosed in the privacy policy. The project has a webAnalytics id but no `enabledAt` — the Enable toggle is dashboard-only (every public API shape tried returned not_found/bad_request), so the script 404s (silently, `defer`) until Alex flips it at vercel.com → dietaisle → Analytics and redeploys.
- SW cache → `dietaisle-v33`.

## v32 — 2026-07-18 · Emoji sweep completed

- Alex flagged leftover emojis after v30 — a second, full-codepoint audit found six the first pass missed: 📡 (Scan a Barcode title), ⏱/💰 (nearby-stores mode toggle), 🚶/🚗 (travel mode), 👋 (dashboard greeting), plus the ↺ refresh glyph. All now Material inline-SVG icons (`scanner`, `timer`, `payments`, `walk`, `car`, `refresh`); the greeting wave is simply gone. Emoji audit across all pictographic Unicode ranges: zero remaining (✓ ✎ ✕ ✦ are typographic glyphs, kept deliberately).
- Note: Supabase project restored by Alex — sign-ins work again as of this release.

## 2026-07-17 · INCIDENT: edge middleware crashed the root URL (no SW bump)

- The `middleware.js` shipped earlier today for dietaisle.com host routing threw `MIDDLEWARE_INVOCATION_FAILED` at the edge, intermittently returning 500 for `/` on production. Existing PWA users were shielded by the service-worker cache; fresh visitors got an error page. Found while E2E-testing v31; middleware deleted.
- Replacement: `vercel.json` **redirects** (which run before the filesystem, unlike rewrites): `dietaisle.com/` and `www.dietaisle.com/` → 302 `/home` (the landing page). Declarative, nothing to crash; the app root for dietaisle.vercel.app is untouched. Verified after deploy: all routes 200, and the full v31 gate flow (friendly error + offline escape + app opens) confirmed on production.
- Lesson recorded: never ship an edge middleware here without hitting the deployed root immediately after — the earlier post-deploy check greps matched on the pre-middleware response and missed it.

## v31 — 2026-07-17 · Gate resilience hotfix — Supabase project is DOWN

- **Found during v30's production E2E: the Supabase project (acfcphgqzxmhthsdpyox.supabase.co) no longer resolves — paused (likely free-tier inactivity) or deleted.** Sign-in/sign-up therefore fail on production, and cloud sync has silently been dead for some time (local-first design masked it). ACTION NEEDED (Alex): restore the project in the Supabase dashboard, or create a new one + run `supabase-setup.sql` + update `SUPABASE_URL`/`SUPABASE_ANON_KEY` in index.html.
- Hotfix so the gate degrades instead of bricking: raw "Failed to fetch" errors map to a human message via `authErrMsg()`, and when the account service is unreachable (`auth.svcDown`) the gate shows a "Continue offline on this device" button — device-local data only, appears ONLY in that failure state, the gate stays strict when the service is up. Existing signed-in sessions still open normally (session token is read locally).

## v30 — 2026-07-17 · Auth gate, Material icons, deletable plans, mobile nav polish

- **Account-gated app** (Alex: "prior to be logged nothing will appear, not even the dashboard" — data lives in the user's row in the DB). Signed out, the app renders only a sign-in screen (brand, tagline, the sign-in/sign-up/magic-link card, theme toggle); header, all tabs, and the bottom bar don't exist until `authed`. The Supabase `app_state` row per user was already the storage model — the gate makes it the front door. Offline PWA safety: a device that has signed in before (`da_authed`) opens with its cached data when launched offline; local dev without Supabase config stays ungated. `ensureUserScope()` wipes the local cache when a *different* account signs in on the same device (prevents user A's data leaking into user B's cloud row). Landing-page copy updated to match (no more "no sign-up required").
- **Emojis replaced with Material-style icons** throughout the chrome: inline-SVG `<app-icon>` component (24dp Material paths, currentColor) — bottom bar, theme/profile buttons, dash quick actions, location/scan/AI/sync/mail/lock/batch-list. No icon font, so offline still works. (Gotcha: the component was first named `<mi>`, which is a native MathML tag — Vue silently treats it as a plain element; renamed.)
- **Any plan can be deleted** (Alex's request), including built-ins: × on every preset pill, confirm dialog, built-ins hide (tombstoned in `da_hpre_v1`, synced) instead of vanishing from code; "Restore deleted default plans" link in the + New plan dialog; can't delete your last plan.
- **Preset pills slide properly on iPhone** (Alex: pills go off-screen): `touch-action:pan-x` + `overscroll-behavior-x:contain` on both header pill rows, plus an end-spacer for Safari's collapsed trailing padding.
- **Macro pills no longer show 0/0/0 on Scan and AI Plan** (Alex asked why: they're day macros and those tabs aren't days — the old code computed macros for a non-day tab). They now render only in Plan context; the stray static "SHOP" pill is gone.

## v29 — 2026-07-17 · Community prices on barcode results (Open Prices)

- Investigated live UK pricing sources again per Alex ("trolley.co.uk or similars"). Trolley.co.uk stays ruled out (no API, ToS bans scraping — full research 2026-07-12 in COMMUNITY_PRICING.md). The one legitimate open source is **Open Prices** (prices.openfoodfacts.org): crowdsourced receipt prices, open licence, queryable by barcode. UK coverage measured today: ~1,947 GBP prices total — far too thin to power the store-comparison engine, but fresh (entries from this week) and useful per-product.
- Barcode lookups now also query Open Prices (`fetchCommunityPrices`, fire-and-forget, 6s timeout, silent on failure/offline): the result card shows up to 4 recent UK community prices — store, date, price — with a "use" button that fills the price field. Section labelled "Recently paid by other UK shoppers · Open Prices".
- Verified live: barcode 4056489932284 → OFF nutrition + two dated Lidl prices from the Open Prices API, "use" fills £2.99.

## v28 — 2026-07-17 · Learned restock cadence + proven-recipe AI prompt

- **Restock times are now calculated, not guessed** (Alex: "I don't know how it is calculating the time" — before, it wasn't; the times were a hardcoded table). Every confirmed receipt/barcode scan already stores a dated price on the product; the new `recomputeRestockLearned()` uses that history: purchase dates under 3 days apart cluster into one shop (multi-store weekends), and an item bought on 2+ separate shops gets its frequency set to the **median gap** between shops (median so one holiday gap doesn't skew it). Runs on every scan confirm and on app load (picks up pre-existing receipts).
- Learned times show a green `×N` chip (N = purchases used) with the calculation explained in a footnote; manually edited times are marked ✎ and are never overwritten by learning; deleted rules are tombstoned so learning can't re-add them. Items bought 2+ times that aren't in the guide get added automatically. `da_restock_v1` now stores `{rules,hidden}` (old array shape still loads).
- **AI meal-plan prompt rewritten for recipe quality** (Alex's request): the model must base every meal on a proven, well-loved recipe (BBC Good Food-calibre, cookbook classics, fitness-food staples) and *adapt* it to the macro targets — scale portions, sensible swaps — instead of inventing generic "protein + veg" combos. Dishes must be named as the recognisable recipe, steps must keep real seasoning/technique, no dinner repeats across the week.
- Verified with seeded data: 5 egg purchases incl. a 2-store weekend → "~7 days ×4"; 2 oats purchases 21d apart → "~3 wks ×2"; single purchase ignored; manual edit and delete both survive recompute + reload.

## v27 — 2026-07-17 · Nav hierarchy restructure + editable Restock Guide

- **One nav level per type** (Alex's UX feedback: days and destinations shared one scrolling row). New fixed bottom tab bar with the 5 destinations DESIGN.md always specified: Plan · Shop · Scan · AI Plan · Dash, active = green. Day tabs (Mon–Sun) now show only in Plan context; the preset row shows only in preset-scoped views (Plan, Shop, Batch list). Plan remembers the last-viewed day (`lastDay`).
- **Batch Shop out of the top-level nav** — it's a shopping list, so it lives with Shop: "📋 Batch-cook list" link in the Shop header, "← Weekly list" back link, Shop stays highlighted in the bar while viewing it. Content unchanged.
- **Restock Guide is now editable** (Alex: must be able to delete items and adjust the time, in case it varies): per-row ✎ edits the frequency inline (Enter or ✓ to save), ✕ removes the rule (with confirm), "Reset to defaults" restores the built-in list. Changes persist in `da_restock_v1`, sync to cloud (added to `collectState`), and the per-item chips on the shopping list follow the edited values (`restockFreq` now reads the live rules).
- Toast repositioned above the bottom bar; content bottom padding increased to clear it.

## v26 — 2026-07-17 · Account moved out of the tab row

- UX fix (Alex): the 👤 Account pill sat at the same level as content destinations (Dash/Shop/Scan/AI Plan/Batch Shop) at the end of the scrolling tab row — wrong hierarchy for a profile/settings destination.
- Account is now a round header button top-right, next to the theme toggle (standard profile placement). Green outline + tint when the Account view is open; a small green dot on the icon when signed in.
- `.htop` buttons wrapped in a `.hbtns` flex group so `justify-content:space-between` doesn't scatter them.
- Existing "Sign in" link on the Dashboard still routes to the same view; nothing else moved.

## 2026-07-17 · Marketing landing page (no SW bump — app untouched)

- New `landing.html` — marketing site for DietAisle, served at `/home` (vercel.json rewrite). Format modelled on MyFitnessPal / Yuka / Eat This Much / Mealime landing pages: sticky nav + CTA, hero with value prop and app mockup, trust strip, alternating feature sections, 3-step "how it works", FAQ, final CTA band.
- App visuals are Yuka-style HTML recreations of real components (verdict card, macro bars, restock chips) using DESIGN.md tokens — no screenshots to go stale.
- Quiet Ledger throughout: Geist/Geist Mono, one green accent, hairlines, 14px radii, dark mode via `prefers-color-scheme` + the app's `da_theme` localStorage key.
- Copy states only true facts: free, localStorage-first, optional sync, one-shot Overpass geolocation, real supermarket coverage. No invented user counts or testimonials.
- Plan: when `dietaisle.com` DNS is connected, its root serves the landing page; the app keeps `dietaisle.vercel.app` root so installed PWAs are unaffected.

## v25 — 2026-07-10 · Zero-data empty states

- Audited every tab for a brand-new user with zero data. Two real gaps found: an empty day plan (all meals removed) showed only the "+ Add meal" button with no framing, and an empty shopping list rendered a stack of bare category headers with no items — looked broken, not empty.
- Fix: day tab shows "Nothing planned for [Day] yet." above the add button. Shop tab shows a "Nothing in the trolley yet" card with Scan receipt / AI plan quick actions when the list has no items, replacing the section headers entirely (voice per DESIGN.md).
- Scan tab, AI Plan tab, Dashboard, and Account tab already had adequate empty/first-run states — left unchanged.
- Batch-Cook shop list is a static reference list (not user-editable per item), so it can't go empty at runtime — no change needed there.

## v24 — 2026-07-09 · WCAG 2.2 AA dark-mode contrast fixes

- Production audit after v23 surfaced dark-mode-only failures v23's light-mode-focused testing missed: `.scan-hero`/`.dash-hero` (white text on the brighter dark-mode green fell to 1.9:1), `.acct-btn.alt`, `.modal-cre` button, and — the real bug — `.modal-input`/`.mf-ing-row input`/`.mf-step-row input` had no explicit `background` at all, so they stayed browser-default white in dark mode (CSS `background` doesn't inherit from a themed parent).
- Fix: dark-mode hero cards pinned to a fixed darker green (`#065F46`, same value proven in light mode); all bare `<input>` elements given an explicit `background:var(--card)` dark override; CTA buttons on bright dark-mode green get dark text.
- Re-verified: 0 axe-core violations on every tab × both themes × the New Plan modal, confirmed directly against the production deployment.

## v23 — 2026-07-09 · WCAG 2.2 AA compliance

- axe-core audit (WCAG 2.0/2.1/2.2 AA rulesets) across every tab, light + dark: 109 colour-contrast violations found → **0 remaining**.
- `--t4` demoted to placeholders/decoration only — all real text and icon buttons now use `--t3`/`--t2` (≥4.5:1 text, ≥3:1 icons).
- Added `:focus-visible` outlines (keyboard focus was invisible before), `scroll-padding-top` so the sticky header can't obscure focused elements (SC 2.4.11), and `prefers-reduced-motion` support.
- Checkboxes 23px→24px (SC 2.5.8 target size); modals get `role="dialog"` + `aria-modal` + labels; toast is a `role="status"` live region so VoiceOver announces saves/removals.
- REQUIREMENTS.md §4.4 upgraded to a WCAG 2.2 AA commitment.

## v22 — 2026-07-08 · Redesign increments 4+5: desktop two-panel + dark mode

- Desktop ≥1024px: real two-panel layout — day plan left, Shop panel (verdict card + list) always visible right. Replaces the lonely centred 600px column. Mobile unchanged.
- Dark mode: full dark token set per DESIGN.md, ◐/☀ toggle in the header, respects `prefers-color-scheme` on first visit, choice persisted as `da_theme`.
- CTA buttons keep readable dark text on the brighter dark-mode green.
- This completes all 5 increments of the "Quiet Ledger" redesign.

## v21 — 2026-07-08 · Redesign increment 3: restock cadence in the shopping list

- Shopping-list items now carry a quiet mono chip (`~2 wks`) showing how often to restock, keyword-matched via the new `RESTOCK_RULES` table (also respects renamed items).
- The static hardcoded Restock Guide block is now data-driven from the same table — one source of truth, three new pantry items added (salt, cinnamon, stevia).
- Requested by Alex 2026-07-08 ("restock section in the shopping list telling you how often each item must be restocked").

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
