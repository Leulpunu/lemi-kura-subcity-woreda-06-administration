// Seed script to add all offices as users
// Run with: node api/seed-offices.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedOfficeUsers() {
  try {
    // First, drop the old users table and recreate with correct schema
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    // Recreate users table with JSONB for accessibleOffices
    await sql`
      CREATE TABLE users (
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
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert Admin user
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES ('Executive Manager', 'admin', ${hashedPassword}, 'admin', 'management', 'አፈፃፀም ሃላፊ', 'Executive Manager', '["all"]'::jsonb)
    `;
    
    // Insert all 10 offices as users
    const offices = [
      { name: 'Party Works', username: 'party', office_id: 'party-works', position_am: 'ፓርቲ ኃላፊ', position_en: 'Party Leader', role: 'sub_admin' },
      { name: 'Work and Skills Officer', username: 'work-skills', office_id: 'work-skills', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Urban Agriculture Officer', username: 'urban-agriculture', office_id: 'urban-agriculture', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Trade Officer', username: 'trade', office_id: 'trade', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Peace and Security Officer', username: 'peace-security', office_id: 'peace-security', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Finance Officer', username: 'finance', office_id: 'finance', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Community Governance Officer', username: 'community-governance', office_id: 'community-governance', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Civil Registration Officer', username: 'civil-registration', office_id: 'civil-registration', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' },
      { name: 'Public Service HR Officer', username: 'public-service-hr', office_id: 'public-service-hr-development', position_am: 'ባለሙያ', position_en: 'Expert', role: 'user' }
    ];
    
    for (const office of offices) {
      const accessibleArr = JSON.stringify([office.office_id]);
      await sql`
        INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
        VALUES (${office.name}, ${office.username}, ${hashedPassword}, ${office.role}, ${office.office_id}, ${office.position_am}, ${office.position_en}, ${accessibleArr}::jsonb)
      `;
    }
    
    console.log('Office users seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin / password123');
    console.log('Party: party / password123');
    console.log('Work Skills: work-skills / password123');
    console.log('Urban Agriculture: urban-agriculture / password123');
    console.log('Trade: trade / password123');
    console.log('Peace Security: peace-security / password123');
    console.log('Finance: finance / password123');
    console.log('Community Governance: community-governance / password123');
    console.log('Civil Registration: civil-registration / password123');
    console.log('Public Service HR: public-service-hr / password123');
    
  } catch (error) {
    console.error('Seed error:', error.message);
  }
  
  process.exit();
}

seedOfficeUsers();
