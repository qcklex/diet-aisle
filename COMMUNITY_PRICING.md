# Community Pricing — research log & plan (in progress)

Started 2026-07-12. Not yet built — this is a continuation log, not a shipped feature. Picks up the Phase 2 roadmap item "Community product database" from `REQUIREMENTS.md` §6, pulled forward because we ruled out Trolley.co.uk as a live-price source (below).

## Why not Trolley.co.uk

Investigated using Trolley.co.uk as a source of live UK supermarket prices (it was listed in `REQUIREMENTS.md` §5.3/§7 as a planned "unofficial API"). Findings:

- **No public API exists.** No developer docs, no API program.
- **Their Terms of Service explicitly ban it**: *"automated coding scripts, website scrapers or website crawlers except in the case of search engine crawling."*
- **`robots.txt` disallows `/search/`** — the exact path needed for price lookups — and blocks known scraper bots (Ahrefs, Semrush, MJ12, DataForSeo).
- **They have direct legal history here**: in 2022 Trolley got a cease-and-desist over aggregated product data and had to either pay ~£29k/yr in licensing or shut down (they're back up now, hence the strict ToS today).
- **Lidl isn't even on Trolley** — confirmed via their own help/feedback page (a user is requesting Lidl be added).
- **Asda/Tesco/etc. pricing is very likely scraped by Trolley itself**, one layer removed from the same ToS problem — using Trolley would mean depending on data Trolley may not be fully entitled to.
- Looked at paid alternatives (Pepesto, Actowiz, RapidAPI "UK Supermarkets Product Pricing") — these are all scraping-as-a-service wrappers around the same retailer sites, not official APIs, and cost money we don't need to spend pre-revenue.

**Conclusion:** no legitimate low-cost live-price API exists for UK supermarkets. `REQUIREMENTS.md` §7's "Trolley.co.uk is unofficial" caveat should be treated as **ruled out**, not just risky — don't revisit scraping it.

## Decided direction: community product database

Crowd-source real prices from DietAisle's own users' receipt scans and barcode lookups — legally clean (it's users' own purchase data, anonymised), and was already the Phase 2 roadmap plan.

### Data model change needed

Current Supabase setup: one table of *private* per-user app state, row-level security = owner-only read/write.

Community pricing needs a **second table**: anonymised `(product_name, store, price, seen_at)` rows.
- Readable by all signed-in users.
- Insertable by any signed-in user.
- Not editable/deletable by anyone but an admin (stop tampering).
- No name/email attached to a price row — just the price data.

### Flow

When a user confirms a scanned receipt item or saves a barcode product:
1. Save to their own private product DB (existing behaviour, unchanged).
2. Also upsert an anonymous `(product_name, store, price, seen_at)` row to the shared table.

Shopping list price lookup order becomes:
1. Your own real scans (existing "real" marker, unchanged priority)
2. Community median price (if recent — proposed 30-day window)
3. AI estimate (existing fallback, unchanged)

### Open questions — need Alex's decision before building

- **Minimum sample size** before a community price is trusted (proposed: ≥2 independent reports).
- **Outlier rejection** so one fat-fingered £0.02 entry doesn't poison the average.
- **Opt-in vs on-by-default** — it's anonymised, but it is still "your purchase data" leaving your device even without an account name attached. Needs an explicit call, and if opt-in, needs a toggle somewhere (Account tab is the natural spot) and a privacy-policy mention either way (see PHASES.md Phase 6 "Privacy policy page" item — write this feature into that doc when it lands, not before, since it doesn't exist in prod yet).

## Next steps to continue this thread

1. Get Alex's answer on the three open questions above.
2. Design the Supabase schema + RLS policies for the shared table.
3. Wire the upsert into `confirmItem()` (receipt scan) and `saveBarcodeProduct()` (barcode flow) in `index.html`.
4. Update the shopping-list price-resolution logic to add the community-median tier.
5. Add the opt-in toggle (if decided) to the Account tab.
6. Update `REQUIREMENTS.md` §5.3/§6/§7 to reflect: Trolley.co.uk removed as a data source, community pricing added, rationale linked.
7. Mention in the privacy policy page once both that page and this feature exist.

## Also unresolved from the same session

- `FINAL_VERSION_PROMPT.md` is still sitting untracked in the repo root — never committed or cleaned up. Decide: commit it as a historical doc, or delete it now that its scope shipped.
- Phase 6 pre-launch items still open (see `PHASES.md`): dietaisle.com DNS → Vercel (domain is registered, just needs connecting), real-device iPhone QA, analytics, privacy policy page, test users, funder demo script.
