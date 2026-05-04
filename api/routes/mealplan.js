import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../db.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a keto meal planning expert. Generate practical, realistic weekly meal plans for someone following a strict ketogenic diet.

Rules:
- All meals must be keto (very low carb <50g total per day, high fat, moderate protein)
- Use only ingredients commonly available at UK supermarkets (especially Lidl and Tesco)
- Keep meals simple — max 5 ingredients, 4 steps
- Prefer air fryer cooking when possible
- Include exact gram weights for all ingredients
- Calculate macros accurately: protein and carbs = 4 kcal/g, fat = 9 kcal/g
- Make the shopping list minimal — reuse ingredients across days`;

router.post('/generate', async (req, res) => {
  const {
    calories = 2000,
    protein = 150,
    fat = 130,
    carbs = 30,
    days = 7,
    budget = 60,
    preferences = [],
    exclude = []
  } = req.body;

  // Get products available in local DB for context
  const db = await getDb();
  const availableProducts = db.data.products.slice(0, 50);
  const productList = availableProducts.map(p => p.name).join(', ');

  const userPrompt = `Generate a ${days}-day keto meal plan.

Targets per day:
- Calories: ~${calories} kcal
- Protein: ~${protein}g
- Fat: ~${fat}g
- Carbs: <${carbs}g

Budget: ~£${budget}/week
${preferences.length ? `Preferences: ${preferences.join(', ')}` : ''}
${exclude.length ? `Exclude: ${exclude.join(', ')}` : ''}
${productList ? `Products I have access to in my area: ${productList}` : ''}

Return JSON in this exact structure:
{
  "days": [
    {
      "id": "mon",
      "label": "Monday",
      "meals": [
        {
          "name": "Meal name",
          "type": "Breakfast",
          "ings": [["Ingredient", "weight/qty"]],
          "steps": ["Step 1", "Step 2"],
          "macros": { "p": 30, "f": 20, "c": 5 }
        }
      ],
      "daily_macros": { "p": 150, "f": 130, "c": 28, "kcal": 1942 }
    }
  ],
  "shopping_list": [
    { "name": "Chicken breast", "qty": "1.5kg", "estimated_price": 3.99, "section": "protein" }
  ],
  "weekly_cost_estimate": 52.50,
  "notes": "Brief plan summary"
}`;

  try {
    let fullResponse = '';

    // Stream the response
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullResponse += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    // Parse and validate the final JSON
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const plan = JSON.parse(jsonMatch[0]);
        res.write(`data: ${JSON.stringify({ done: true, plan })}\n\n`);
      } catch {
        res.write(`data: ${JSON.stringify({ done: true, raw: fullResponse })}\n\n`);
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// Quick macro check — is this meal plan hitting targets?
router.post('/check', async (req, res) => {
  const { meals } = req.body;
  if (!meals?.length) return res.status(400).json({ error: 'meals required' });

  const totals = meals.reduce((acc, m) => {
    acc.p += m.macros?.p || 0;
    acc.f += m.macros?.f || 0;
    acc.c += m.macros?.c || 0;
    return acc;
  }, { p: 0, f: 0, c: 0 });

  totals.kcal = Math.round(totals.p * 4 + totals.f * 9 + totals.c * 4);

  res.json({ totals, meals_count: meals.length });
});

export default router;
