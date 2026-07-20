# Keto API

## Setup

```bash
cd keto-app/api
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm install
npm run dev
```

API runs at http://localhost:3001

## Endpoints

| Method | Path | What it does |
|--------|------|-------------|
| POST | /api/scan | Receipt image → extracted items + prices |
| POST | /api/scan/confirm | Save a confirmed scanned item |
| GET | /api/products/search?query= | Search local product DB |
| POST | /api/products/match | Match product name → nutrition (OFF → USDA → Claude) |
| GET | /api/products/barcode/:code | Barcode → full nutrition |
| POST | /api/products | Manually save a product |
| GET | /api/prices/product/:id | All known prices for a product |
| GET | /api/prices/live/trolley?q= | Live prices from Trolley.co.uk |
| POST | /api/prices | Manually save a price |
| GET | /api/prices/restock | Restock predictions from pantry |
| POST | /api/mealplan/generate | AI-generated keto meal plan (streaming) |

## Deploy (free)

Works on Railway, Render, or Fly.io. Set the `ANTHROPIC_API_KEY` env var.
Update `API_BASE` in `index.html` to your deployed URL.

## Data

All data stored in `keto.json` — a plain JSON file, no database setup needed.
