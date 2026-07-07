# DietAisle — Product Requirements Specification

**Version:** 1.0  
**Date:** May 2026  
**Status:** In Development

---

## 1. Product Overview

DietAisle is a progressive web app (PWA) that generates personalised weekly meal plans based on the user's macro and calorie goals, then produces a smart shopping list that compares real-time prices across UK supermarkets — telling the user exactly where to shop for the cheapest basket.

The app is diet-agnostic and fitness-forward. While initially built around a ketogenic diet, it supports any dietary approach (cutting, bulking, high-protein, vegan, carnivore, Mediterranean, intermittent fasting, etc.) by adjusting the macro targets — making it equally useful for people focused on fat loss, muscle gain, athletic performance, or general health.

---

## 2. Target Users

**Primary users:** People who track macros, follow a structured diet, or train regularly — and do their own grocery shopping in the UK.

**Profiles:**
- Fitness enthusiasts and gym-goers tracking calories and protein for body composition
- Athletes and active individuals meal-prepping around a training schedule
- Anyone on a structured diet (keto, IF, high-protein, bulk, cut, etc.)
- Budget-conscious shoppers who want to eat well without overspending
- Shops regularly at Lidl, Aldi, Tesco, or ASDA
- Mobile-first — uses the app primarily on their phone
- Not necessarily technical — expects things to "just work"

---

## 3. Core Features

### 3.1 Meal Planning
- User sets daily targets: calories, protein (g), fat (g), carbohydrates (g)
- User sets weekly budget (£) and number of days (1–7)
- AI generates a full meal plan matching the targets
- Each meal includes: name, type (Breakfast/Lunch/Dinner/Snack/Evening), ingredients with exact gram weights, cooking steps, and per-meal macros
- Meal plans can be saved as named presets
- Meals can be added or removed per day
- Step-by-step cooking instructions with progress tracking

### 3.2 AI-Powered Shopping List
- Shopping list is automatically derived from the generated meal plan
- Each item includes estimated prices at: Lidl, Aldi, Tesco, ASDA
- Cheapest store per item is highlighted
- Items can be removed from the list
- Removed items are saved to a "Recently removed" section and can be restored
- Shopping list can be filtered by store

### 3.3 Store Price Comparison
- Full basket cost calculated per store
- Visual bar chart comparing total spend at each store
- Recommendation engine: identifies the single cheapest store for the full basket
- Split-shop suggestion: identifies if buying specific items at a second store saves meaningful money
- Prices from scanned receipts override AI estimates (marked as "real")

### 3.4 Receipt Scanning
- User photographs a receipt from any UK supermarket
- Claude Vision AI extracts every line item: product name (as printed), interpreted name, pack size, price
- Each extracted item is automatically matched to a nutritional database
- Nutritional matching pipeline: local DB → Open Food Facts → USDA FoodData Central → Claude estimation
- Confidence level shown per item: high / medium / low
- User confirms or skips each item
- Confirmed items are saved to the local product database with price and store

### 3.5 Product Database
- Personal product database stored in localStorage
- Populated via receipt scanning and barcode lookup
- Each product stores: name, barcode, calories per 100g, protein, fat, carbs, fibre, category, source, confidence
- Price history per store attached to each product
- Real prices from the database are used to enrich AI shopping list estimates

### 3.6 Barcode Scanning
- User scans a product barcode at the store (live camera via BarcodeDetector where supported; manual entry on iOS Safari)
- Instant nutritional lookup via Open Food Facts
- User adds the current price and store
- Product saved to database with price history

### 3.7 Accounts & Cloud Sync
- Optional accounts — the app remains fully usable without signing in
- Email/password sign-up and sign-in, plus passwordless magic-link login (Supabase Auth)
- Signed-in users get their full app state (meal plans, edits, product DB) backed up to the cloud
- Sync is automatic (debounced after every change) with a manual "Sync now" button
- Newest-data-wins merge on login: cloud state is applied only if newer than local
- Row-level security: each user can only ever read/write their own data

### 3.8 Dashboard
- At-a-glance home screen: greeting, today's date and active plan
- Today's macros vs daily goals with progress bars (calories, protein, fat, carbs)
- Weekly shop cost, product database size, real-price count, cheapest store this week
- Sync status indicator and quick actions (scan receipt, AI plan, shop list)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- App must load and be interactive within 3 seconds on a 4G mobile connection
- Receipt scanning response within 10 seconds
- Meal plan generation begins streaming within 3 seconds of request

### 4.2 Offline Support
- App shell, meal plans, and shopping lists must be accessible offline via service worker
- Product database available offline (localStorage)
- AI features degrade gracefully with a clear "requires connection" message

### 4.3 Privacy
- No user accounts required — accounts are strictly optional (for cross-device sync)
- No personal data sent to any server except meal plan preferences (anonymous) and, if the user taps "Find stores near me," their coordinates to OpenStreetMap's Overpass API (disclosed in-app, not stored or linked to an account)
- Receipt images are sent to Claude API and immediately discarded — not stored
- All personal data (meal plans, product DB, shopping history) stays on the user's device in localStorage by default
- With an account, app state is additionally backed up to Supabase, protected by row-level security (only the owner can access it)
- API key stored server-side only, never exposed to the browser; the Supabase anon key is public by design and grants no data access without a valid user session

### 4.4 Accessibility
- Minimum tap target size: 44×44px
- Colour contrast ratio minimum 4.5:1 for body text
- All interactive elements have aria-labels
- Works with iOS VoiceOver

### 4.5 Platform
- Primary: iOS Safari (PWA installed to home screen)
- Secondary: Android Chrome
- Desktop: supported but not optimised
- Maximum content width: 600px (centred on desktop)

---

## 5. Technical Architecture

### 5.1 Frontend
- **Framework:** Vue 3 (CDN, no build step)
- **Rendering:** Client-side
- **State persistence:** localStorage
- **PWA:** Service worker + Web App Manifest
- **Hosting:** Vercel (static)

### 5.2 Backend
- **Runtime:** Vercel Edge Functions
- **Proxy:** `/api/chat` — proxies Claude API requests, holds API key server-side
- **No database:** all user data is client-side

### 5.3 External APIs
| API | Purpose | Cost |
|-----|---------|------|
| Anthropic Claude (claude-sonnet-4-6) | Receipt scanning, meal plan generation | ~$0.01–0.02/use |
| Anthropic Claude (claude-haiku-4-5) | Nutrition estimation fallback | ~$0.001/use |
| Open Food Facts | Nutritional data lookup | Free |
| USDA FoodData Central | Nutritional data fallback | Free |
| Trolley.co.uk | Live UK supermarket prices | Free (unofficial) |

### 5.4 Data Flow
```
Receipt photo → /api/chat (Claude Vision) → item extraction
                                          → Open Food Facts lookup
                                          → USDA fallback
                                          → Claude estimation fallback
                                          → localStorage product DB

Macro goals → /api/chat (Claude Sonnet) → meal plan + shopping list
                                        → local DB price overlay
                                        → store comparison engine
                                        → recommendation
```

---

## 6. Feature Roadmap

### Phase 1 — Current
- [x] Preset meal plans (Air Fryer Week, Beef & Salmon)
- [x] Manual add/remove meals
- [x] Shopping list with prices and categories
- [x] AI meal plan generation with macro targets
- [x] Per-store price comparison (Lidl, Aldi, Tesco, ASDA)
- [x] Store recommendation + split-shop suggestion
- [x] Receipt scanning via Claude Vision
- [x] Nutritional matching (OFF → USDA → Claude)
- [x] Local product database
- [x] Remove + restore shopping list items
- [x] PWA (installable, offline shell)

### Phase 2 — Next
- [x] Barcode scanning at the store
- [x] User accounts + cloud sync (moved up from Phase 3)
- [x] Dashboard home screen
- [ ] Community product database (shared across users)
- [ ] Restock calendar — predict when items will run out
- [ ] Lidl/Aldi weekly specials integration
- [ ] One-tap export to Tesco/Ocado basket
- [ ] Pantry tracking — mark items as already in stock

### Phase 3 — Future
- [ ] Multiple dietary profiles per account
- [ ] Social: share meal plans
- [ ] Nutrition history and trend tracking
- [ ] Integration with fitness trackers (Apple Health, Garmin)
- [ ] Budget optimiser — automatically swap ingredients to hit a price target

---

## 7. Constraints

- Lidl and Aldi have no public APIs — prices rely on receipt scanning and AI estimates
- Trolley.co.uk is an unofficial API — may become unavailable without notice
- Claude API requires paid credits — app is not viable at zero cost
- localStorage limit (~5MB) constrains the size of the local product database
- USDA API uses a rate-limited `DEMO_KEY` — should be replaced with a registered key for production
