# DietAisle — Style Guide

> **SUPERSEDED (2026-07-08):** the "Quiet Ledger" redesign in **DESIGN.md** is now the design source of truth. This file documents the v1 (green-header) system and is kept for reference until the redesign ships.

**Version:** 1.0  
**Date:** May 2026

---

## 1. Brand Identity

### Mission
Make eating well and shopping smart feel effortless — for any diet, any budget, any UK supermarket.

### Tone of Voice
- **Direct.** No fluff. Tell the user exactly what they need to know.
- **Practical.** Real prices, real stores, real food. Not aspirational lifestyle content.
- **Encouraging, not preachy.** Support the user's goals, never lecture them.
- **British.** Trolley not cart. Quid not dollars. Courgette not zucchini.

### Personality
Knowledgeable friend who happens to know which supermarket is cheapest this week and can plan your meals around it.

---

## 2. Colour Palette

### Primary — Green
The brand colour. Used for the header, primary actions, success states, and macro highlights.

| Token | Hex | Usage |
|-------|-----|-------|
| `--g` | `#16A34A` | Primary green — buttons, checkboxes, progress bars |
| `--gbg` | `#F0FDF4` | Green background — card highlights, active states |
| `--gd` | `#15803D` | Green dark — links, secondary text on green bg |
| `--gdk` | `#166534` | Green darkest — header background, primary CTAs |

### Accent — Orange
Used for warnings, "air fryer" tags, and urgent restock alerts.

| Token | Hex | Usage |
|-------|-----|-------|
| `--or` | `#C2410C` | Orange — warning text |
| `--orbg` | `#FFF7ED` | Orange background — warning cards |

### Accent — Blue
Used for informational states, "real price" indicators, portable meal tags.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bl` | `#1D4ED8` | Blue — info text, real price dots |
| `--blbg` | `#EFF6FF` | Blue background — info chips |

### Accent — Yellow
Used for college day indicators and low-confidence nutrition warnings.

| Token | Hex | Usage |
|-------|-----|-------|
| `--ybg` | `#FFFBEB` | Yellow background |
| `--ybr` | `#FDE68A` | Yellow border |
| `--ytx` | `#92400E` | Yellow text |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F5F5F0` | Page background — warm off-white |
| `--card` | `#FFFFFF` | Card background |
| `--bd` | `#E5E7EB` | Border — standard |
| `--bdl` | `#F3F4F6` | Border light — dividers, secondary backgrounds |
| `--t1` | `#111827` | Text primary |
| `--t2` | `#374151` | Text secondary |
| `--t3` | `#6B7280` | Text tertiary — labels, metadata |
| `--t4` | `#9CA3AF` | Text disabled — placeholder, muted |

---

## 3. Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
```
System font stack — uses SF Pro on iOS/macOS, Segoe UI on Windows, Roboto on Android. No web font to load, instant rendering.

### Scale

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| App title | 17px | 800 | Header app name |
| Section heading | 15px | 700 | Card titles, modal titles |
| Body | 14px | 400–600 | Meal names, item names |
| Meta | 13px | 400–500 | Ingredients, steps, descriptions |
| Label | 11px | 700 | Section labels (ALL CAPS + letter-spacing) |
| Micro | 10px | 600–700 | Tags, badges, confidence dots |
| Tiny | 9px | 500 | Macro pill labels |

### Section Labels
All section dividers and category labels use:
```css
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.07–0.08em;
color: var(--t3);
```

---

## 4. Spacing & Layout

### Container
- Max width: **600px**, centred
- Horizontal padding: **14px** (main content), **16px** (header)
- Bottom padding: `24px + safe-area-inset-bottom` (accounts for iPhone home bar)

### Card Spacing
- Card padding: **13px 15px**
- Card gap: **9px** between cards
- Border radius: **14px** (cards), **12px** (smaller cards), **8px** (chips/buttons), **5px** (micro badges)

### Touch Targets
- Minimum: **44×44px** for all interactive elements
- Edit/delete icons: padded to at least 44px touch area even if visually smaller

---

## 5. Components

### Cards
Standard content card:
```css
background: var(--card);
border: 1px solid var(--bd);
border-radius: 14px;
padding: 13px 15px;
margin-bottom: 9px;
```

### Buttons — Primary
```css
background: var(--g);  /* or var(--gdk) for emphasis */
color: #fff;
border: none;
border-radius: 8–10px;
font-weight: 700;
padding: 9–12px 16–22px;
```

### Buttons — Secondary
```css
background: var(--bdl);
color: var(--t3);
border: none;
border-radius: 8–10px;
font-weight: 500;
```

### Buttons — Destructive
```css
background: none;
border: 1px solid #FCA5A5;
color: #EF4444;
border-radius: 8px;
```

### Tab Pills (Navigation)
```css
/* Default */
background: rgba(255,255,255,0.15);
color: rgba(255,255,255,0.8);
border-radius: 20px;
font-size: 13px;
font-weight: 500;

/* Active */
background: #fff;
color: var(--gdk);
font-weight: 700;
```

### Macro Pills (Header)
```css
background: rgba(255,255,255,0.15);
border-radius: 8px;
padding: 4px 8px;
```
Value: 14px / 700 / white  
Label: 9px / 500 / white 65% opacity

### Checkbox (Shopping list)
- 23×23px circle
- Default: white fill, `var(--bd)` border
- Checked: `var(--g)` fill and border, white checkmark SVG

### Tags / Badges

| Type | Background | Text colour | Usage |
|------|-----------|------------|-------|
| Air Fryer | `var(--orbg)` | `var(--or)` | Meal tag |
| Portable | `var(--gbg)` | `var(--gd)` | Meal tag |
| ON Protein | `var(--blbg)` | `var(--bl)` | Meal tag |
| Optional | `var(--bdl)` | `var(--t3)` | Shopping item |
| Store badge | `rgba(255,255,255,0.2)` | `#fff` | On dark backgrounds |
| Store badge | `var(--bdl)` | `var(--t2)` | On light backgrounds |

### Confidence Indicators (Nutrition)
```
● High    — #16A34A (green dot)
● Medium  — #D97706 (amber dot)
● Low     — #EF4444 (red dot)
```

### Progress Bar (Cooking steps)
```css
height: 3px;
background: var(--bdl);  /* track */
/* fill */
background: var(--g);
border-radius: 2px;
```

### Toast Notification
```css
background: #1F2937;
color: #fff;
border-radius: 12px;
padding: 10px 16px;
font-size: 13px;
```
Undo action text: `#86EFAC` (green)  
Auto-dismisses after 4 seconds.

### Section Divider
```css
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.08em;
color: var(--t3);
/* with trailing line */
::after { content:''; flex:1; height:1px; background:var(--bd); }
```

---

## 6. Iconography

No icon library. Icons are either:
- **Unicode emoji** — used sparingly for tabs (🛒 📷 ✦)
- **Inline SVG** — for functional icons (checkmark, edit pencil)
- **CSS-drawn** — spinner animation

### Tab Icons
| Tab | Icon |
|-----|------|
| Days (Mon–Sun) | Text only |
| Shop | 🛒 |
| Scan | 📷 |
| AI Plan | ✦ |

---

## 7. Motion & Animation

Kept minimal — no heavy transitions.

| Element | Animation |
|---------|-----------|
| Toast notification | `opacity + translateY`, 200ms |
| Step arrow | `rotate(90deg)`, 150ms |
| Progress bar fill | `width`, 300ms |
| Spinner | `rotate`, 700ms linear infinite |
| Store bar | `width`, 400ms |

No page transitions. No skeleton loaders — components render immediately with data.

---

## 8. Header

The sticky header has three zones:

```
┌─────────────────────────────────────┐
│  APP TITLE        [P] [F] [C] pills │  ← 12px 16px 8px padding
│  Preset name · macro summary        │
├─────────────────────────────────────┤
│  [Plan A] [Plan B] [+ New plan]     │  ← horizontal scroll
├─────────────────────────────────────┤
│  [Mon] [Tue] [Wed] … [🛒] [📷] [✦] │  ← horizontal scroll
└─────────────────────────────────────┘
```

Background: `var(--gdk)` (#166534)  
All text: white or white with opacity

---

## 9. Empty & Loading States

### Loading (AI / Scan)
```
Spinner (28px, 3px border, green top)
"Reading receipt with AI…" / "Generating…"
font-size: 14px, color: var(--t3), centred
```

### Empty state
```
font-size: 13px
color: var(--t3)
text-align: center
padding: 20px 0
line-height: 1.6
```

### AI streaming
```css
background: var(--bdl);
border-radius: 10px;
padding: 12px 14px;
font-size: 12px;
font-family: monospace;
max-height: 200px;
overflow-y: auto;
```

---

## 10. Modals

```css
background: #fff;
border-radius: 18px;
padding: 22px 20px;
max-width: 340px;
width: 100%;
```

Overlay: `rgba(0,0,0,0.5)` — tap outside to dismiss  
Tall modals (add meal): `max-height: 88vh; overflow-y: auto`

---

## 11. Writing Style

### Labels
- Section labels: ALL CAPS (`PROTEIN`, `DAIRY & CHEESE`)
- Button labels: Title Case (`Add meal`, `Clear checked`)
- Tab labels: Title Case (`Mon`, `Shop`, `AI Plan`)

### Numbers
- Prices: `~£3.49` (tilde for estimates, no tilde for confirmed)
- Macros: `32g P · 25g F · 3g C`
- Calories: `≈ 354 kcal`
- Weights: `750g`, `1.5kg`, `×18`

### Feedback messages (toast)
- Positive: `Saved: Chicken Breast`, `AI plan imported!`
- Removal: `Removed: Olive oil`
- Keep under 40 characters — toasts are one line

### Placeholder text
Be specific, not generic:
- ✓ `e.g. 750g` not `Enter quantity`
- ✓ `Plan name (e.g. Week 3)` not `Enter name`
- ✓ `Price (e.g. 1.99)` not `Enter price`
