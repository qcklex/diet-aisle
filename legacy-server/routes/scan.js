import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, unlinkSync } from 'fs';
import { getDb, q } from '../db.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RECEIPT_PROMPT = `Parse this supermarket receipt image. Extract every purchased item.

Return ONLY valid JSON in this exact shape:
{
  "store": "Lidl",
  "date": "2024-01-15",
  "items": [
    { "raw": "CHKN BRST 750G", "name": "Chicken Breast", "weight": "750g", "quantity": 1, "price": 3.49 }
  ],
  "total": 24.50
}

Rules:
- "raw" is exactly as printed on the receipt
- "name" is your best human-readable interpretation
- "weight" is pack size if visible, otherwise null
- "quantity" defaults to 1 if not shown
- "price" is the line price in GBP as a number
- "date" in YYYY-MM-DD, null if not visible
- "total" is the final amount paid, null if not visible`;

router.post('/', async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const imageData = readFileSync(file.path);
    const base64 = imageData.toString('base64');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: req.file.mimetype, data: base64 } },
          { type: 'text', text: RECEIPT_PROMPT }
        ]
      }]
    });

    unlinkSync(file.path);

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(422).json({ error: 'Could not parse receipt', raw });

    const parsed = JSON.parse(jsonMatch[0]);
    const db = await getDb();

    const receipt_id = await q.saveReceipt(db, {
      store: parsed.store,
      date: parsed.date,
      total: parsed.total,
      raw_text: raw
    });

    // Try to match each item against existing products
    const enriched = await Promise.all(parsed.items.map(async item => {
      const existing = await q.findProduct(db, item.name.split(' ')[0]);
      return {
        ...item,
        receipt_id,
        matched: !!existing,
        product: existing || null,
        needs_nutrition: !existing
      };
    }));

    res.json({
      receipt_id,
      store: parsed.store,
      date: parsed.date,
      total: parsed.total,
      items: enriched,
      unmatched_count: enriched.filter(i => !i.matched).length
    });

  } catch (err) {
    if (file?.path) { try { unlinkSync(file.path); } catch {} }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Confirm a scanned item — saves price + creates/links product
router.post('/confirm', async (req, res) => {
  const { receipt_id, raw_name, product_id, price, store, pack_size, postcode } = req.body;

  try {
    const db = await getDb();

    await q.saveReceiptItem(db, {
      receipt_id, raw_name, product_id, price, matched: true, quantity: 1
    });

    await q.savePrice(db, {
      product_id, store, price, pack_size: pack_size || null,
      date: new Date().toISOString().split('T')[0],
      source: 'receipt_scan', confirmed: true, postcode: postcode || null
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
