const express = require('express');
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Seed database with initial data
router.post('/seed', async (req, res) => {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        office VARCHAR(50),
        position_am VARCHAR(255),
        position_en VARCHAR(255),
        "accessibleOffices" JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS offices (
        office_id VARCHAR(50) PRIMARY KEY,
        name_am VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id VARCHAR(50),
        level INTEGER DEFAULT 1,
        target NUMERIC(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(existingUsers[0].count) > 0) {
      return res.json({ message: 'Database already seeded' });
    }

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('password123', 10);

    // Insert admin user
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'አስተዳዳሪ', 
        'admin', 
        ${hashedAdminPassword}, 
        'admin', 
        'ማኔጅመንት', 
        'አስተዳዳሪ',
        'Manager',
        ${JSON.stringify(['all'])}
      )
    `;

    // Insert sub_admin user
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ተስፋዬ', 
        'tesfaye', 
        ${hashedUserPassword}, 
        'sub_admin', 
        'የለሚ ኩራ ቢሮ', 
        'ሰብአዊ ሃብት',
        'Human Resource',
        ${JSON.stringify(['office-1', 'office-2', 'office-3'])}
      )
    `;

    // Insert regular user
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ወርቅነህ', 
        'user', 
        ${hashedUserPassword}, 
        'user', 
        'ፋይናንስ ቢሮ', 
        'ፋይናንስ ባህርይ',
        'Finance Officer',
        ${JSON.stringify(['office-1'])}
      )
    `;

    // Insert sample offices
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

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
