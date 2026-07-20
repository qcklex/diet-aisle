import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import scanRouter from './routes/scan.js';
import productsRouter from './routes/products.js';
import pricesRouter from './routes/prices.js';
import mealplanRouter from './routes/mealplan.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: join(__dir, 'uploads/') });

app.use(cors());
app.use(express.json());

// Receipt scanning — accepts image upload
app.use('/api/scan', upload.single('receipt'), scanRouter);

// Product database — nutritional lookup + matching
app.use('/api/products', productsRouter);

// Price data — local DB + live Trolley/Tesco
app.use('/api/prices', pricesRouter);
app.use('/api/restock', pricesRouter);

// AI meal plan generation
app.use('/api/mealplan', mealplanRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Keto API running on http://localhost:${PORT}`);
  console.log(`  POST /api/scan          — receipt image → extracted items`);
  console.log(`  POST /api/products/match — name → nutritional data`);
  console.log(`  GET  /api/prices/live/trolley?q= — live UK supermarket prices`);
  console.log(`  POST /api/mealplan/generate — AI keto meal plan`);
});
