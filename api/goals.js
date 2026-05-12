import { getDb, ensureTables } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  await ensureTables(sql);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT month_key, ciro_goal::float, sales_goal
        FROM goals
      `;
      // Convert to { "2025-05": { ciroGoal, salesGoal } } shape
      const map = {};
      for (const r of rows) {
        map[r.month_key] = { ciroGoal: r.ciro_goal, salesGoal: r.sales_goal };
      }
      return res.json(map);
    }

    if (req.method === 'POST') {
      const { monthKey, ciroGoal, salesGoal } = req.body;
      if (!monthKey) return res.status(400).json({ error: 'monthKey zorunludur' });
      await sql`
        INSERT INTO goals (month_key, ciro_goal, sales_goal)
        VALUES (${monthKey}, ${ciroGoal ?? 0}, ${salesGoal ?? 0})
        ON CONFLICT (month_key) DO UPDATE
          SET ciro_goal = ${ciroGoal ?? 0}, sales_goal = ${salesGoal ?? 0}, updated_at = NOW()
      `;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
