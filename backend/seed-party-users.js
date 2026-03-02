const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// Party Works office tasks (for reference)
const partyTasks = [
  { id: 'task-1', name_am: 'የቤተሰብ ውይይት', name_en: 'Family Discussion' },
  { id: 'task-2', name_am: 'የአባላት ክፍያ', name_en: 'Member Payment' },
  { id: 'task-3', name_am: 'የአባላት ምልመላ', name_en: 'Member Selection' },
  { id: 'task-4', name_am: 'ህገደንብ ውይይት', name_en: 'Charter Discussion' }
];

// Create 21 Party Works users
const partyUsers = [];

const baseNamesAm = [
  'የቤተሰብ ውይይት ኃላፊ',
  'የአባላት ክፍያ ኃላፊ',
  'የአባላት ምልመላ ኃላፊ',
  'ህገደንብ ውይይት ኃላፊ',
  'ጸሃፊ',
  'አካውንታንት',
  'አስተባባሪ',
  'ግራ መጋቢ',
  'ቀኝ መጋቢ',
  'ክትትል አስተባባሪ',
  'ፋይናንስ ኃላፊ',
  'ሪፖርት አዘጋጅ',
  'ሰነድ አስተናጋጅ',
  'ኮሚቶ አስተባባሪ',
  'ዞን ኃላፊ',
  'ቀበሌ ኃላፊ',
  'ህዝብ ግንኙነት',
  'ትምህርት ኃላፊ',
  'ሴቶች ኃላፊ',
  'ወጣቶች ኃላፊ',
  'አርቲስት'
];

const baseNamesEn = [
  'Family Discussion Head',
  'Member Payment Head',
  'Member Selection Head',
  'Charter Discussion Head',
  'Secretary',
  'Accountant',
  'Coordinator',
  'Left Assistant',
  'Right Assistant',
  'Monitor Coordinator',
  'Finance Head',
  'Report Officer',
  'Document Officer',
  'Committee Coordinator',
  'Zone Head',
  'Sub-city Head',
  'Public Relations',
  'Education Head',
  'Women Head',
  'Youth Head',
  'Artist'
];

// Generate 21 users
for (let i = 0; i < 21; i++) {
  partyUsers.push({
    name: `${baseNamesAm[i] || `Party User ${i+1}`}`,
    username: `party_user_${i+1}`,
    password: `party${i+1}`,
    role: 'user',
    office: 'party-works',
    position_am: baseNamesAm[i] || `Party Works User ${i+1}`,
    position_en: baseNamesEn[i] || `Party Works User ${i+1}`,
    accessibleOffices: ['party-works']
  });
}

async function seedPartyUsers() {
  try {
    // Get next available ID
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) as max_id FROM users`;
    let nextId = maxIdResult[0].max_id + 1;

    let created = 0;
    let skipped = 0;

    for (const user of partyUsers) {
      // Check if user exists
      const existingUser = await sql`SELECT * FROM users WHERE username = ${user.username}`;
      
      if (existingUser.length === 0) {
        await sql`
          INSERT INTO users (id, name, username, password, role, office, position_am, position_en, "accessibleOffices")
          VALUES (
            ${nextId},
            ${user.name},
            ${user.username},
            ${user.password},
            ${user.role},
            ${user.office},
            ${user.position_am},
            ${user.position_en},
            ${JSON.stringify(user.accessibleOffices)}::jsonb
          )
        `;
        console.log(`Created user: ${user.username} - ${user.position_en}`);
        created++;
        nextId++;
      } else {
        console.log(`User ${user.username} already exists`);
        skipped++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Created: ${created} users`);
    console.log(`Skipped: ${skipped} users (already exist)`);

    // Show all Party Works users
    console.log('\n=== Party Works Users ===');
    const partyUsersResult = await sql`
      SELECT id, name, username, role, office, position_en 
      FROM users 
      WHERE office = 'party-works'
      ORDER BY id
    `;
    console.table(partyUsersResult);

    console.log('\n=== Login Credentials ===');
    console.log('Party Works Subadmin:');
    console.log('  Username: party');
    console.log('  Password: party123');
    console.log('\nParty Works Users (21 users):');
    partyUsers.forEach((u, i) => {
      console.log(`  ${u.position_en}: ${u.username} / ${u.password}`);
    });

  } catch (err) {
    console.error('Error seeding party users:', err.message);
  }
}

seedPartyUsers();
