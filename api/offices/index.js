const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  try {
    const offices = await sql`SELECT * FROM offices ORDER BY name_en`;
    res.status(200).json(offices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
