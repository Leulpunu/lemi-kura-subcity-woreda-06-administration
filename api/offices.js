const express = require('express');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Seed initial offices
async function seedInitialOffices() {
  try {
    const existingOffices = await sql`SELECT COUNT(*) as count FROM offices`;
    if (parseInt(existingOffices[0].count) > 0) {
      console.log('Offices already exist, skipping seed');
      return;
    }

    const offices = [
      { office_id: 'office-1', name_am: 'ፋይናንስ ቢሮ', name_en: 'Finance Office', level: 1, target: 100000 },
      { office_id: 'office-2', name_am: 'ሰብአዊ ሃብት ቢሮ', name_en: 'Human Resource Office', level: 1, target: 50000 },
      { office_id: 'office-3', name_am: 'ንብረት አስተዳደር ቢሮ', name_en: 'Property Administration Office', level: 1, target: 30000 },
      { office_id: 'office-4', name_am: 'ማህበራዊ ጉዳይ ቢሮ', name_en: 'Social Affairs Office', level: 1, target: 40000 },
      { office_id: 'office-5', name_am: 'ጤና ቢሮ', name_en: 'Health Office', level: 1, target: 60000 },
    ];

    for (const office of offices) {
      await sql`
        INSERT INTO offices (office_id, name_am, name_en, level, target)
        VALUES (${office.office_id}, ${office.name_am}, ${office.name_en}, ${office.level}, ${office.target})
      `;
    }

    console.log('✅ Initial offices seeded');
  } catch (error) {
    console.error('❌ Office seed error:', error.message);
  }
}

let officesInitialized = false;

// Get all offices
router.get('/', async (req, res) => {
  try {
    if (!officesInitialized) {
      await seedInitialOffices();
      officesInitialized = true;
    }
    const offices = await sql`SELECT * FROM offices ORDER BY name_en`;
    res.json(offices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get office by ID
router.get('/:id', async (req, res) => {
  try {
    const offices = await sql`SELECT * FROM offices WHERE id = ${req.params.id}`;
    if (offices.length === 0) {
      return res.status(404).json({ message: 'Office not found' });
    }
    res.json(offices[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
