import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';

const __dir = dirname(fileURLToPath(import.meta.url));

const defaults = {
  products: [],        // { id, name, barcode, calories, protein, fat, carbs, fiber, category, source, confidence, created_at }
  product_prices: [],  // { id, product_id, store, price, pack_size, unit_price, postcode, date, source, confirmed }
  receipts: [],        // { id, store, date, total, raw_text, created_at }
  receipt_items: [],   // { id, receipt_id, raw_name, product_id, quantity, price, matched }
  pantry: [],          // { id, product_id, quantity, unit, weekly_usage, updated_at }
  _seq: { products: 0, product_prices: 0, receipts: 0, receipt_items: 0, pantry: 0 }
};

let _db;

export async function getDb() {
  if (_db) return _db;
  _db = await JSONFilePreset(join(__dir, 'keto.json'), defaults);
  return _db;
}

// Helper: next auto-increment id for a table
export function nextId(db, table) {
  db.data._seq[table] = (db.data._seq[table] || 0) + 1;
  return db.data._seq[table];
}

// Thin query helpers so route code stays readable
export const q = {
  async findProduct(db, nameLike) {
    const term = nameLike.toLowerCase();
    return db.data.products.find(p => p.name.toLowerCase().includes(term)) || null;
  },

  async findProductByBarcode(db, barcode) {
    return db.data.products.find(p => p.barcode === barcode) || null;
  },

  async searchProducts(db, term) {
    const t = term.toLowerCase();
    return db.data.products
      .filter(p => p.name.toLowerCase().includes(t))
      .slice(0, 20)
      .map(p => {
        const latestPrices = {};
        db.data.product_prices
          .filter(pp => pp.product_id === p.id)
          .sort((a, b) => b.date.localeCompare(a.date))
          .forEach(pp => { if (!latestPrices[pp.store]) latestPrices[pp.store] = pp; });
        return { ...p, prices: Object.values(latestPrices) };
      });
  },

  async saveProduct(db, product) {
    const existing = product.barcode ? db.data.products.find(p => p.barcode === product.barcode) : null;
    if (existing) return existing.id;
    const id = nextId(db, 'products');
    db.data.products.push({ ...product, id, created_at: new Date().toISOString() });
    await db.write();
    return id;
  },

  async savePrice(db, price) {
    const id = nextId(db, 'product_prices');
    db.data.product_prices.push({ ...price, id, created_at: new Date().toISOString() });
    await db.write();
    return id;
  },

  async saveReceipt(db, receipt) {
    const id = nextId(db, 'receipts');
    db.data.receipts.push({ ...receipt, id, created_at: new Date().toISOString() });
    await db.write();
    return id;
  },

  async saveReceiptItem(db, item) {
    const id = nextId(db, 'receipt_items');
    db.data.receipt_items.push({ ...item, id });
    await db.write();
    return id;
  },

  async getPricesForProduct(db, productId) {
    const rows = db.data.product_prices
      .filter(pp => pp.product_id === productId)
      .sort((a, b) => b.date.localeCompare(a.date));
    const byStore = {};
    rows.forEach(r => { if (!byStore[r.store]) byStore[r.store] = r; });
    return Object.values(byStore);
  },

  async getRestockPredictions(db) {
    return db.data.pantry
      .map(pa => {
        const product = db.data.products.find(p => p.id === pa.product_id);
        if (!product) return null;
        const days_remaining = pa.weekly_usage > 0
          ? Math.round(pa.quantity / pa.weekly_usage * 7)
          : null;
        return {
          name: product.name,
          quantity: pa.quantity,
          unit: pa.unit,
          weekly_usage: pa.weekly_usage,
          days_remaining,
          status: days_remaining === null ? 'unknown'
                : days_remaining <= 3 ? 'urgent'
                : days_remaining <= 7 ? 'soon'
                : 'ok'
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.days_remaining ?? 999) - (b.days_remaining ?? 999));
  }
};
