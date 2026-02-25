require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql } = require('./db');

async function fixPasswords() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('New hash:', hashedPassword);
    
    await sql`UPDATE users SET password = ${hashedPassword}`;
    console.log('Passwords updated successfully!');
    
    // Verify
    const users = await sql`SELECT username, password FROM users`;
    console.log('Updated users:');
    users.forEach(u => console.log(`  ${u.username}: ${u.password.substring(0, 30)}...`));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixPasswords();
