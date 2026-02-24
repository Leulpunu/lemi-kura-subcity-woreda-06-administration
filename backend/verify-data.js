const { sql } = require('./db');

async function verifyData() {
  try {
    console.log('Verifying imported data...\n');

    // Check users
    const users = await sql`SELECT id, name, username, role, office FROM users`;
    console.log(`Users (${users.length}):`);
    users.forEach(u => console.log(`  - ${u.username}: ${u.name} (${u.role}) - ${u.office}`));

    // Check offices
    const offices = await sql`SELECT office_id, name_en FROM offices`;
    console.log(`\nOffices (${offices.length}):`);
    offices.forEach(o => console.log(`  - ${o.office_id}: ${o.name_en}`));

    console.log('\n✅ Data verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyData();
