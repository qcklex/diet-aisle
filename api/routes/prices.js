import { Router } from 'express';
import { getDb, q } from '../db.js';

const router = Router();

router.get('/product/:productId', async (req, res) => {
  const db = await getDb();
  res.json(await q.getPricesForProduct(db, parseInt(req.params.productId)));
});

// Live prices from Trolley.co.uk (covers Tesco, Sainsbury's, ASDA, Morrisons, Waitrose)
router.get('/live/trolley', async (req, res) => {
  const { q: query } = req.query;
  if (!query) return res.status(400).json({ error: 'q required' });

  try {
    const url = `https://dev.trolley.co.uk/api/products/search/?q=${encodeURIComponent(query)}&per_page=5`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'KetoPlanner/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    const results = (data.products || data || []).slice(0, 5).map(p => ({
      name: p.name || p.title,
      store: p.supermarket || p.store,
      price: p.price || p.current_price,
      pack_size: p.size || p.weight,
      url: p.url,
      in_stock: p.in_stock !== false
    })).filter(p => p.price);

    res.json({ source: 'trolley', available: true, results });
  } catch (err) {
    // Trolley may be down or rate-limit — return gracefully
    res.json({ source: 'trolley', available: false, message: err.message });
  }
});

// Save a manually entered or receipt-scanned price
router.post('/', async (req, res) => {
  const { product_id, store, price, pack_size, postcode } = req.body;
  if (!product_id || !store || !price) return res.status(400).json({ error: 'product_id, store, price required' });

  const db = await getDb();
  await q.savePrice(db, {
    product_id, store, price,
    pack_size: pack_size || null,
    date: new Date().toISOString().split('T')[0],
    source: 'manual', confirmed: true,
    postcode: postcode || null
  });

  res.json({ ok: true });
});

// Restock predictions
router.get('/restock', async (req, res) => {
  const db = await getDb();
  res.json(await q.getRestockPredictions(db));
});

export default router;
