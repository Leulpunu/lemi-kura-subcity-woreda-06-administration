const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
  try {
    // Check offices table
    const officesColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'offices'
    `;
    console.log('Offices table columns:', officesColumns);
    
    // Check users table
    const usersColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    console.log('Users table columns:', usersColumns);
    
    // Check if data exists
    const users = await sql`SELECT * FROM users LIMIT 5`;
    console.log('Users:', users);
    
    const offices = await sql`SELECT * FROM offices LIMIT 5`;
    console.log('Offices:', offices);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTables();
