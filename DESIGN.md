# Design System — DietAisle · "Quiet Ledger"

Approved 2026-07-08 via /design-consultation (preview: `~/.gstack/projects/qcklex-diet-aisle/designs/design-system-20260708/preview.html`). This file is the source of truth for all visual decisions. Supersedes STYLEGUIDE.md v1.0.

## Product Context
- **What this is:** Mobile-first PWA — AI weekly meal planning + UK supermarket price comparison ("it knows where's cheapest").
- **Who it's for:** UK macro-trackers, gym-goers, people building or keeping food habits. Not necessarily technical.
- **Project type:** Web app (iOS Safari PWA primary, desktop secondary but properly designed).
- **Rejected direction (logged):** "Shelf Edge" receipt-punk — too cartoonish for a habit/nutrition tool. Keep its one insight: money gets its own typographic voice.

## Aesthetic Direction
- **Direction:** Modern minimalist health tool. Calm enough to live in daily; precise where it counts (goals, money).
- **Decoration level:** Minimal — whitespace, hairlines, soft shadows. Typography and data do the work.
- **Mood:** Trustworthy, quiet, supportive. Nothing shouts. Anything green is progress or savings — nothing else competes.

## Typography
- **Family:** **Geist** (400/500/600/700) — single family keeps it minimal and fast.
- **Data/Prices/Macros:** **Geist Mono** (400/500/600) with `font-variant-numeric: tabular-nums`. **Rule: money and macro numbers are never set in the body font.**
- **Loading:** one Google Fonts link: `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap`
- **Scale:** hero number 26px/600 mono · heading 28px/700 (-.02em) · card title 15px/600 · body 15px/400 · meta 13px · section label 12px/600 uppercase .09em · chips 12px/500 · mono meta 12px.

## Color
- **Approach:** Restrained — one accent + warm neutrals; semantic colors are whispers, not features.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#FAFAF8` | `#0F1210` | page background (warm near-white / near-black) |
| `--surface` | `#FFFFFF` | `#171B18` | cards |
| `--text` | `#1A1D1B` | `#ECEEEA` | primary text |
| `--muted` | `#6B7069` | `#9AA096` | secondary text |
| `--line` | `#E8E8E3` | `#252A26` | hairline borders |
| `--line2` | `#F1F1ED` | `#1D221E` | row dividers, bar tracks |
| `--green` | `#047857` | `#34D399` | THE accent: actions, progress, savings, active tab |
| `--green-soft` | `#ECFDF5` | `#0C2C21` | green chip backgrounds |
| `--amber` | `#B45309` | `#FBBF24` | price rises, warnings (semantic only) |
| `--red` | `#DC2626` | `#F87171` | destructive, over-budget (semantic only) |

- **Dark mode:** first-class, via `[data-theme="dark"]` on `<html>` + `prefers-color-scheme` default. Persist choice in localStorage (`da_theme`).
- **Shadow:** `0 1px 2px rgba(26,29,27,.04), 0 4px 16px rgba(26,29,27,.05)` (deepened in dark).

## Spacing
- **Base unit:** 4px. **Density:** comfortable-compact (data app, but breathing room between cards).
- Card padding 16–20px · card gap 12–14px · list row 11px vertical · screen padding 16–18px.

## Layout
- **Mobile (<1024px):** single column, max 600px centred. Bottom tab bar: 5 labelled destinations (Plan, Shop, Scan, AI, Dash), active = green.
- **Desktop (≥1024px):** two-panel — Plan left (1.1fr), Shop & prices right (0.9fr), verdict always visible while planning.
- **Border radius:** cards 14px · buttons/inputs 10px · chips 999px · checkboxes 7px. (No hard shadows, no 2px ink borders.)
- **Touch targets:** ≥44px. Progressive disclosure: cooking steps collapsed by default.

## Signature Elements
- **Verdict card** (Shop tab hero): "CHEAPEST FOR YOUR LIST · NEAR YOU" label, store name + mono price on one baseline, green "Save £X vs Y" + distance, then per-store rows (name, price bar, mono price, distance) with ✓ on the winner. Powered by on-demand geolocation (no background tracking — iOS PWA constraint and privacy promise).
- **Restock chips:** quiet mono pills (`~2 wks`) on shopping-list rows; "due to restock" grouping.
- **List rows:** rounded-square checkboxes (green ✓ when done, strikethrough label), dotted-free, hairline dividers, mono prices right-aligned.
- **Macro dashboard:** label + green track bar + `current / goal` in mono per macro.

## Motion
- **Approach:** minimal-functional. 150–250ms ease-out on state changes only.
- Progress bars animate width on load; verdict total counts up once when prices resolve; buttons scale(.98) on press. No page transitions, no floating, no parallax.

## Voice in the chrome
Direct, British, supportive: "Save £4.60 vs Tesco", "Nothing in the trolley yet — scan a receipt or generate a plan." Toasts under 40 chars; savings toasts may bold the amount in green.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-08 | Initial system ("Quiet Ledger") created | /design-consultation: research (MFP/ETM/Trolley archetypes) + outside voice; user rejected receipt-punk v1 as cartoonish; wants minimalist, modern, easy to use |
| 2026-07-08 | Geist + Geist Mono | Modern single-family system, tabular nums for money/macros, Google Fonts, no build step |
| 2026-07-08 | Green demoted from chrome to meaning | Old #166534 header was brand wallpaper; new #047857 appears only as progress/savings/action — "anything green is a win" |
