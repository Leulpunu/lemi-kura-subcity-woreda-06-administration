const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// All offices from the system
const offices = [
  { id: 'executive', name_am: 'አፈፃፀም ሃላፊ', name_en: 'Executive Office' },
  { id: 'work-skills', name_am: 'ስራና ክህሎት ጽ/ቤት', name_en: 'Work and Skills Office' },
  { id: 'urban-agriculture', name_am: 'ከተማ ግብርና ጽ/ቤት', name_en: 'Urban Agriculture Office' },
  { id: 'trade', name_am: 'ንግድ ጽ/ቤት', name_en: 'Trade Office' },
  { id: 'peace-security', name_am: 'ሰላምና ጸጥታ ጽ/ቤት', name_en: 'Peace and Security Office' },
  { id: 'finance', name_am: 'ፋይናንስ ጽ/ቤት', name_en: 'Finance Office' },
  { id: 'community-governance', name_am: 'ህብረተሰብ ተሳትፎና በጎፍቃድ ማስተባበሪያ ጽ/ቤት', name_en: 'Community Participation and Good Governance Office' },
  { id: 'civil-registration', name_am: 'ሲቪል ምዝገባ ጽ/ቤት', name_en: 'Civil Registration Office' },
  { id: 'public-service-hr-development', name_am: 'የፐብሊክ ሰርቪስና የሰው ሀብት ልማት ጽ/ቤት', name_en: 'Public Service and Human Resource Development Office' },
  { id: 'party-works', name_am: 'የፓርቲ ስራዎች ለጠቅላላ አመራሩ', name_en: 'Party Works for General Administration' }
];

// All users to be created
const users = [
  // Super Administrator - Executive Manager
  {
    name: 'ተስፋዬ መኮንን',
    username: 'tesfaye',
    password: 'password123',
    role: 'admin',
    office: 'executive',
    position_am: 'አፈፃፀም ሃላፊ',
    position_en: 'Executive Manager',
    accessibleOffices: offices.map(o => o.id)
  },
  // Work and Skills Office - User (mikael)
  {
    name: 'ሚካኤል ደስታ',
    username: 'mikael',
    password: 'password123',
    role: 'user',
    office: 'work-skills',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['work-skills']
  },
  // Party Works - Sub Admin (can view all annual plans but only their own office reports)
  {
    name: 'ፓርቲ ኃላፊ',
    username: 'party',
    password: 'party123',
    role: 'subadmin',
    office: 'party-works',
    position_am: 'ፓርቲ ስራ ኃላፊ',
    position_en: 'Party Works Head / Sub Admin',
    accessibleOffices: ['party-works']
  },
  // Work and Skills Office - User
  {
    name: 'ስራና ክህሎት ባለሙያ',
    username: 'work_skills',
    password: 'work123',
    role: 'user',
    office: 'work-skills',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['work-skills']
  },
  // Urban Agriculture Office - User
  {
    name: 'ከተማ ግብርና ባለሙያ',
    username: 'urban_agriculture',
    password: 'urban_agriculture',
    role: 'user',
    office: 'urban-agriculture',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['urban-agriculture']
  },
  // Trade Office - User
  {
    name: 'ንግድ ባለሙያ',
    username: 'trade',
    password: 'trade123',
    role: 'user',
    office: 'trade',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['trade']
  },
  // Peace and Security Office - User
  {
    name: 'ሰላምና ጸጥታ ባለሙያ',
    username: 'peace_security',
    password: 'peace123',
    role: 'user',
    office: 'peace-security',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['peace-security']
  },
  // Finance Office - User
  {
    name: 'ፋይናንስ ባለሙያ',
    username: 'finance',
    password: 'finance123',
    role: 'user',
    office: 'finance',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['finance']
  },
  // Community Governance Office - User
  {
    name: 'ህብረተሰብ ተሳትፎ ባለሙያ',
    username: 'community',
    password: 'community123',
    role: 'user',
    office: 'community-governance',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['community-governance']
  },
  // Civil Registration Office - User
  {
    name: 'ሲቪል ምዝገባ ባለሙያ',
    username: 'civil_registration',
    password: 'civil123',
    role: 'user',
    office: 'civil-registration',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['civil-registration']
  },
  // Public Service and HR Development Office - User
  {
    name: 'የፐብሊክ ሰርቪስ ባለሙያ',
    username: 'public_service',
    password: 'public123',
    role: 'user',
    office: 'public-service-hr-development',
    position_am: 'ባለሙያ',
    position_en: 'Expert',
    accessibleOffices: ['public-service-hr-development']
  }
];

async function seedUsers() {
  try {
    // Check if users table exists
    await sql`CREATE TABLE IF NOT EXISTS users (
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
    )`;

    // Insert users
    for (const user of users) {
      // Check if user exists
      const existingUser = await sql`SELECT * FROM users WHERE username = ${user.username}`;
      
      if (existingUser.length === 0) {
        await sql`
          INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
          VALUES (
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
        console.log(`Created user: ${user.username} (${user.role})`);
      } else {
        console.log(`User ${user.username} already exists`);
      }
    }
    
    // Show all users
    const allUsers = await sql`SELECT id, name, username, role, office FROM users ORDER BY id`;
    console.log('\nAll users in database:');
    console.table(allUsers);
    
    console.log('\n=== Login Credentials ===');
    console.log('Super Admin (Executive Manager):');
    console.log('  Username: tesfaye');
    console.log('  Password: password123');
    console.log('\nParty Admin:');
    console.log('  Username: party');
    console.log('  Password: party123');
    console.log('\nOffice Users (all have password: office123):');
    users.filter(u => u.role === 'user').forEach(u => {
      console.log(`  ${u.name_en}: ${u.username} / ${u.password}`);
    });
    
  } catch (err) {
    console.error('Error seeding users:', err.message);
  }
}

seedUsers();
