const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    // Create Users Table
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
    
    // Create Offices Table
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
    
    // Create Reports Table
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        office_id VARCHAR(50),
        task_id VARCHAR(50),
        value NUMERIC(10, 2) DEFAULT 0,
        date DATE,
        description TEXT,
        reported_by INTEGER,
        report_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create Annual Plans Table
    await sql`
      CREATE TABLE IF NOT EXISTS annual_plans (
        id SERIAL PRIMARY KEY,
        office_id VARCHAR(50),
        task_id VARCHAR(50),
        annual_targets JSONB,
        distributed_plans JSONB,
        year INTEGER NOT NULL,
        submitted_by INTEGER,
        status VARCHAR(20) DEFAULT 'draft',
        approved_by INTEGER,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50) DEFAULT 'info',
        recipient VARCHAR(50),
        sender VARCHAR(255),
        office VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) DEFAULT 'medium',
        data JSONB,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Initialize on first request
let dbInitialized = false;

// Seed initial users
async function seedInitialUsers() {
  try {
    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(existingUsers[0].count) > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'አስተዳዳሪ', 
        'admin', 
        ${hashedPassword}, 
        'admin', 
        'ማኔጅመንት', 
        'አስተዳዳሪ',
        'Executive Manager',
        ${JSON.stringify(['all'])}
      )
    `;

    // 2. Sub-admin = Party (ፓርቲ) - political office
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ፓርቲ', 
        'party', 
        ${hashedPassword}, 
        'sub_admin', 
        'ፓርቲ', 
        'ፓርቲ ኃላፊ',
        'Party Leader',
        ${JSON.stringify(['all'])}
      )
    `;

    // 3. User/Client = Regular office workers
    // Finance Office
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ፋይናንስ ባህርይ', 
        'finance', 
        ${hashedPassword}, 
        'user', 
        'ፋይናንስ ቢሮ', 
        'ፋይናንስ ባህርይ',
        'Finance Officer',
        ${JSON.stringify(['office-1'])}
      )
    `;

    // Human Resource Office
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ሰብአዊ ሃብት ባህርይ', 
        'hr', 
        ${hashedPassword}, 
        'user', 
        'ሰብአዊ ሃብት ቢሮ', 
        'ሰብአዊ ሃብት ባህርይ',
        'HR Officer',
        ${JSON.stringify(['office-2'])}
      )
    `;

    // Property Administration Office
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ንብረት አስተዳዳሪ', 
        'property', 
        ${hashedPassword}, 
        'user', 
        'ንብረት አስተዳደር ቢሮ', 
        'ንብረት አስተዳዳሪ',
        'Property Administrator',
        ${JSON.stringify(['office-3'])}
      )
    `;

    // Social Affairs Office
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ማህበራዊ ጉዳይ ባህርይ', 
        'social', 
        ${hashedPassword}, 
        'user', 
        'ማህበራዊ ጉዳይ ቢሮ', 
        'ማህበራዊ ጉዳይ ባህርይ',
        'Social Affairs Officer',
        ${JSON.stringify(['office-4'])}
      )
    `;

    // Health Office
    await sql`
      INSERT INTO users (name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (
        'ጤና ባህርይ', 
        'health', 
        ${hashedPassword}, 
        'user', 
        'ጤና ቢሮ', 
        'ጤና ባህርይ',
        'Health Officer',
        ${JSON.stringify(['office-5'])}
      )
    `;

    console.log('✅ Initial users seeded');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
}

// Login
router.post('/login', async (req, res) => {
  // Initialize database tables on first request
  if (!dbInitialized) {
    await initializeDatabase();
    await seedInitialUsers();
    dbInitialized = true;
  }
  
  const { username, password } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { name, username, password, role, office, position_am, position_en, accessibleOffices } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO users (id, name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (${nextId}, ${name}, ${username}, ${hashedPassword}, ${role}, ${office}, ${position_am}, ${position_en}, ${JSON.stringify(accessibleOffices || [])})
    `;
    
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await sql`SELECT id, name, username, role, office, position_am, position_en FROM users`;
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
