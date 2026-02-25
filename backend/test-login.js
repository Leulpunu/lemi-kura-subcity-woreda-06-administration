require('dotenv').config();
const { sql } = require('./db');

async function testLogin() {
  try {
    const users = await sql`SELECT * FROM users`;
    console.log('Users found:', users.length);
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLogin();
