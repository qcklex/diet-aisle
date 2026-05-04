import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getDb, q } from '../db.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  const db = await getDb();
  res.json(await q.searchProducts(db, query));
});

// Match a name to nutritional data: local DB → OFF → USDA → Claude fallback
router.post('/match', async (req, res) => {
  const { raw_name, interpreted_name, store } = req.body;
  if (!interpreted_name) return res.status(400).json({ error: 'interpreted_name required' });

  const db = await getDb();

  // 1. Local DB
  const local = await q.findProduct(db, interpreted_name.split(' ').slice(0, 2).join(' '));
  if (local) return res.json({ source: 'local_db', confidence: 'high', product: local });

  // 2. Open Food Facts (UK)
  try {
    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(interpreted_name)}&search_simple=1&action=process&json=1&page_size=5&lc=en&cc=gb`;
    const offRes = await fetch(offUrl, { signal: AbortSignal.timeout(5000) });
    const offData = await offRes.json();

    if (offData.products?.length > 0) {
      const p = offData.products[0];
      const n = p.nutriments || {};
      const product = {
        name: interpreted_name,
        barcode: p.code || null,
        calories: n['energy-kcal_100g'] ?? null,
        protein: n['proteins_100g'] ?? null,
        fat: n['fat_100g'] ?? null,
        carbs: n['carbohydrates_100g'] ?? null,
        fiber: n['fiber_100g'] ?? null,
        category: p.categories_tags?.[0]?.replace('en:', '') || null,
        source: 'openfoodfacts',
        confidence: 'high'
      };
      product.id = await q.saveProduct(db, product);
      return res.json({ source: 'openfoodfacts', confidence: 'high', product });
    }
  } catch (e) { console.warn('OFF error:', e.message); }

  // 3. USDA FoodData Central
  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(interpreted_name)}&pageSize=3&api_key=DEMO_KEY`,
      { signal: AbortSignal.timeout(5000) }
    );
    const usdaData = await usdaRes.json();

    if (usdaData.foods?.length > 0) {
      const food = usdaData.foods[0];
      const get = (id) => food.foodNutrients?.find(n => n.nutrientId === id)?.value ?? null;
      const product = {
        name: interpreted_name,
        barcode: null,
        calories: get(1008), protein: get(1003), fat: get(1004),
        carbs: get(1005), fiber: get(1079),
        category: food.foodCategory || null,
        source: 'usda', confidence: 'medium'
      };
      product.id = await q.saveProduct(db, product);
      return res.json({ source: 'usda', confidence: 'medium', product });
    }
  } catch (e) { console.warn('USDA error:', e.message); }

  // 4. Claude estimation
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Estimate nutritional values per 100g for: "${interpreted_name}" (from ${store || 'a UK supermarket'}).
Return ONLY JSON: {"calories":0,"protein":0,"fat":0,"carbs":0,"fiber":0}
Use standard UK keto food values. null for anything you can't estimate.`
      }]
    });

    const jsonMatch = msg.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const est = JSON.parse(jsonMatch[0]);
      const product = { name: interpreted_name, barcode: null, ...est, category: null, source: 'ai_estimated', confidence: 'low' };
      product.id = await q.saveProduct(db, product);
      return res.json({ source: 'ai_estimated', confidence: 'low', product });
    }
  } catch (e) { console.warn('Claude estimation error:', e.message); }

  res.status(404).json({ error: 'Could not match product' });
});

// Barcode lookup
router.get('/barcode/:code', async (req, res) => {
  const { code } = req.params;
  const db = await getDb();

  const local = await q.findProductByBarcode(db, code);
  if (local) return res.json({ source: 'local_db', confidence: 'high', product: local });

  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, { signal: AbortSignal.timeout(5000) });
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product) {
      const p = offData.product;
      const n = p.nutriments || {};
      const product = {
        name: p.product_name_en || p.product_name || 'Unknown',
        barcode: code,
        calories: n['energy-kcal_100g'] ?? null,
        protein: n['proteins_100g'] ?? null,
        fat: n['fat_100g'] ?? null,
        carbs: n['carbohydrates_100g'] ?? null,
        fiber: n['fiber_100g'] ?? null,
        category: p.categories_tags?.[0]?.replace('en:', '') || null,
        source: 'openfoodfacts', confidence: 'high'
      };
      product.id = await q.saveProduct(db, product);
      return res.json({ source: 'openfoodfacts', confidence: 'high', product });
    }
  } catch (e) { console.warn('Barcode lookup error:', e.message); }

  res.status(404).json({ error: 'Product not found' });
});

// Manual save
router.post('/', async (req, res) => {
  const { name, barcode, calories, protein, fat, carbs, fiber, category } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const db = await getDb();
  const id = await q.saveProduct(db, { name, barcode: barcode || null, calories, protein, fat, carbs, fiber, category: category || null, source: 'manual', confidence: 'high' });
  res.json({ id, name });
});

export default router;
