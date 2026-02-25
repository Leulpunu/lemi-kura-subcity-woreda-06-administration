const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// All offices from the project
const offices = [
  { office_id: 'executive', name_am: 'አፈፃፀም', name_en: 'Executive Office', level: 1 },
  { office_id: 'work-skills', name_am: 'ስራና ክህሎት ጽ/ቤት', name_en: 'Work and Skills Office', level: 2 },
  { office_id: 'urban-agriculture', name_am: 'ከተማ ግብርና ጽ/ቤት', name_en: 'Urban Agriculture Office', level: 2 },
  { office_id: 'trade', name_am: 'ንግድ ጽ/ቤት', name_en: 'Trade Office', level: 2 },
  { office_id: 'peace-security', name_am: 'ሰላምና ጸጥታ ጽ/ቤት', name_en: 'Peace and Security Office', level: 2 },
  { office_id: 'finance', name_am: 'ፋይናንስ ጽ/ቤት', name_en: 'Finance Office', level: 2 },
  { office_id: 'community-governance', name_am: 'ህብረተሰብ ተሳትፎና በጎፍቃድ ማስተባበሪያ ጽ/ቤት', name_en: 'Community Participation and Good Governance Office', level: 2 },
  { office_id: 'civil-registration', name_am: 'ሲቪል ምዝገባ ጽ/ቤት', name_en: 'Civil Registration Office', level: 2 },
  { office_id: 'public-service-hr-development', name_am: 'የፐብሊክ ሰርቪስና የሰው ሀብት ልማት ጽ/ቤት', name_en: 'Public Service and Human Resource Development Office', level: 2 },
  { office_id: 'party-works', name_am: 'የፓርቲ ስራዎች ለጠቅላላ አመራሩ', name_en: 'Party Works for General Administration', level: 2 }
];

async function seedOffices() {
  try {
    // Create offices table
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

    // Insert offices
    for (const office of offices) {
      // Check if office exists
      const existing = await sql`SELECT * FROM offices WHERE office_id = ${office.office_id}`;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO offices (office_id, name_am, name_en, level, target)
          VALUES (${office.office_id}, ${office.name_am}, ${office.name_en}, ${office.level}, 0)
        `;
        console.log(`Created office: ${office.office_id} - ${office.name_en}`);
      } else {
        console.log(`Office ${office.office_id} already exists`);
      }
    }
    
    // Show all offices
    const allOffices = await sql`SELECT office_id, name_am, name_en, level FROM offices ORDER BY level, office_id`;
    console.log('\nAll offices in database:');
    console.table(allOffices);
    
  } catch (err) {
    console.error('Error seeding offices:', err.message);
  }
}

seedOffices();
