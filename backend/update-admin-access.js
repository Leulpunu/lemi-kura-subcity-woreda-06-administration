const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// All offices that should be accessible by admin
const allOfficeIds = [
  'executive',
  'work-skills',
  'urban-agriculture',
  'trade',
  'peace-security',
  'finance',
  'community-governance',
  'civil-registration',
  'public-service-hr-development',
  'party-works'
];

async function updateAdminAccess() {
  try {
    // Update the admin user (tesfaye) to have access to all offices
    const result = await sql`
      UPDATE users 
      SET "accessibleOffices" = ${JSON.stringify(allOfficeIds)}::jsonb
      WHERE username = 'tesfaye'
      RETURNING id, name, username, role, "accessibleOffices"
    `;

    if (result.length > 0) {
      console.log('Admin user updated successfully!');
      console.log('Updated accessibleOffices:', result[0].accessibleOffices);
    } else {
      console.log('Admin user not found');
    }

    // Also update the party user to have subadmin role properly
    const partyResult = await sql`
      UPDATE users 
      SET role = 'subadmin', office = 'party-works', "accessibleOffices" = ${JSON.stringify(['party-works'])}::jsonb
      WHERE username = 'party'
      RETURNING id, name, username, role, office, "accessibleOffices"
    `;

    if (partyResult.length > 0) {
      console.log('\nParty user updated successfully!');
      console.log('Updated party user:', partyResult[0]);
    } else {
      console.log('\nParty user not found');
    }

    // Show all users to verify
    console.log('\n=== All Users ===');
    const allUsers = await sql`SELECT id, name, username, role, office, "accessibleOffices" FROM users ORDER BY id`;
    console.table(allUsers);

  } catch (err) {
    console.error('Error updating admin access:', err.message);
  }
}

updateAdminAccess();
