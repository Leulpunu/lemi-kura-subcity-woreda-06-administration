require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testLogin() {
  try {
    const username = 'mikael';
    const password = 'password123';
    
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (users.length === 0) {
      console.log('User not found');
      return;
    }

    const user = users[0];
    console.log('User found:', user.username);
    console.log('Stored password:', user.password);
    console.log('Input password:', password);
    console.log('Password match:', user.password === password);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLogin();
