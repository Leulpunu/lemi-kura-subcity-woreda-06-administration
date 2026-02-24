const { sql } = require('./db');

async function createSchema() {
  try {
    console.log('Creating database schema...');

    // Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        office VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created');

    // Create Offices Table
    await sql`
      CREATE TABLE IF NOT EXISTS offices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(50),
        parent_office VARCHAR(255),
        target DECIMAL(10, 2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Offices table created');

    // Create Reports Table
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        office_id INTEGER REFERENCES offices(id),
        report_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        kpi_values JSONB,
        submitted_by VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        report_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Reports table created');

    // Create Annual Plans Table
    await sql`
      CREATE TABLE IF NOT EXISTS annual_plans (
        id SERIAL PRIMARY KEY,
        office_id INTEGER REFERENCES offices(id),
        year INTEGER NOT NULL,
        target_amount DECIMAL(10, 2),
        achieved_amount DECIMAL(10, 2),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Annual Plans table created');

    // Create Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Notifications table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_office_id ON reports(office_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_annual_plans_office_id ON annual_plans(office_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_annual_plans_year ON annual_plans(year)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`;
    console.log('✅ Indexes created');

    // Insert sample offices
    await sql`
      INSERT INTO offices (name, code, type, target, description) VALUES
        ('Lemi Kura Subcity', 'LK001', 'subcity', 1000000, 'Main subcity office'),
        ('Woreda 06', 'WK006', 'woreda', 500000, 'Woreda 06 administration'),
        ('Finance Office', 'FIN01', 'department', 300000, 'Finance and budget department'),
        ('Planning Office', 'PLAN01', 'department', 200000, 'Planning and development office'),
        ('Admin Office', 'ADMIN01', 'department', 150000, 'Administration and general services')
      ON CONFLICT (code) DO NOTHING
    `;
    console.log('✅ Sample offices inserted');

    console.log('\n🎉 Database schema created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    process.exit(1);
  }
}

createSchema();
