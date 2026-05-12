import { getDb, ensureTables } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  await ensureTables(sql);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT date::text, ciro::float, sales
        FROM entries
        ORDER BY date ASC
      `;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { date, ciro, sales } = req.body;
      if (!date || ciro == null || sales == null) {
        return res.status(400).json({ error: 'date, ciro ve sales zorunludur' });
      }
      await sql`
        INSERT INTO entries (date, ciro, sales)
        VALUES (${date}, ${ciro}, ${sales})
        ON CONFLICT (date) DO UPDATE
          SET ciro = ${ciro}, sales = ${sales}, updated_at = NOW()
      `;
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { date } = req.body;
      if (!date) return res.status(400).json({ error: 'date zorunludur' });
      await sql`DELETE FROM entries WHERE date = ${date}`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
