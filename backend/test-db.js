const { sql } = require('./db');

async function testConnection() {
  try {
    console.log('Testing Neon PostgreSQL connection...');
    
    // Test the connection by executing a simple query
    const result = await sql`SELECT version()`;
    
    console.log('✅ Connection successful!');
    console.log('PostgreSQL Version:', result[0].version);
    
    // Test creating a simple table
    await sql`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Test table created successfully!');
    
    // Insert a test record
    const insertResult = await sql`
      INSERT INTO test_connection (message) 
      VALUES ('Connection test successful!')
      RETURNING id, message, created_at
    `;
    console.log('✅ Test record inserted:', insertResult[0]);
    
    // Read the test record
    const selectResult = await sql`SELECT * FROM test_connection ORDER BY id DESC LIMIT 1`;
    console.log('✅ Test record retrieved:', selectResult[0]);
    
    console.log('\n🎉 All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
