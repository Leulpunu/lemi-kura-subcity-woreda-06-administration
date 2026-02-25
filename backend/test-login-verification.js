require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql } = require('./db');

async function testLogin() {
  try {
    const users = await sql`SELECT password FROM users WHERE username = 'admin'`;
    const match = await bcrypt.compare('password123', users[0].password);
    console.log('Login test result:', match);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLogin();
