const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  const { method, body } = req;

  try {
    if (method === 'GET') {
      const plans = await sql`SELECT * FROM annual_plans ORDER BY year DESC, created_at DESC`;
      return res.status(200).json(plans);
    }
    
    if (method === 'POST') {
      const { office_id, year, targets, budget, description, created_by } = body;
      const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM annual_plans`;
      const nextId = maxIdResult[0].next_id;
      
      await sql`
        INSERT INTO annual_plans (id, office_id, year, targets, budget, description, created_by)
        VALUES (${nextId}, ${office_id}, ${year}, ${JSON.stringify(targets)}, ${budget}, ${description}, ${created_by})
      `;
      
      return res.status(201).json({ message: 'Annual plan created' });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
