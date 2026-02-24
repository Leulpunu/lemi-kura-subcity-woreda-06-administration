const { sql } = require('./db');

async function updateSchema() {
  try {
    console.log('Updating database schema to match MongoDB models...');

    // Drop existing tables if they exist (for clean migration)
    await sql`DROP TABLE IF EXISTS notifications CASCADE`;
    await sql`DROP TABLE IF EXISTS annual_plans CASCADE`;
    await sql`DROP TABLE IF EXISTS reports CASCADE`;
    await sql`DROP TABLE IF EXISTS offices CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('✅ Dropped existing tables');

    // Create Users Table (matching MongoDB User model)
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
        office VARCHAR(255) NOT NULL,
        position_am VARCHAR(255) NOT NULL,
        position_en VARCHAR(255) NOT NULL,
        "accessibleOffices" TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created');

    // Create Offices Table (matching MongoDB Office model)
    await sql`
      CREATE TABLE offices (
        id SERIAL PRIMARY KEY,
        office_id VARCHAR(255) UNIQUE NOT NULL,
        name_am VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        icon VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL,
        tasks JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Offices table created');

    // Create Reports Table (matching MongoDB Report model)
    await sql`
      CREATE TABLE reports (
        id SERIAL PRIMARY KEY,
        "officeId" VARCHAR(255) NOT NULL,
        "taskId" VARCHAR(255) NOT NULL,
        "kpiId" VARCHAR(255) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        "userId" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Reports table created');

    // Create Annual Plans Table (matching MongoDB AnnualPlan model)
    await sql`
      CREATE TABLE annual_plans (
        id SERIAL PRIMARY KEY,
        "officeId" VARCHAR(255) NOT NULL,
        "taskId" VARCHAR(255) NOT NULL,
        "annualTargets" JSONB NOT NULL,
        "distributedPlans" JSONB,
        year INTEGER NOT NULL,
        "submittedBy" INTEGER NOT NULL,
        "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
        "approvedBy" INTEGER,
        "approvedAt" TIMESTAMP,
        "rejectionReason" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("officeId", "taskId", year)
      )
    `;
    console.log('✅ Annual Plans table created');

    // Create Notifications Table
    await sql`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        "isRead" BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Notifications table created');

    // Create indexes
    await sql`CREATE INDEX idx_reports_office_id ON reports("officeId")`;
    await sql`CREATE INDEX idx_reports_task_id ON reports("taskId")`;
    await sql`CREATE INDEX idx_reports_kpi_id ON reports("kpiId")`;
    await sql`CREATE INDEX idx_reports_date ON reports(date)`;
    await sql`CREATE INDEX idx_annual_plans_office_id ON annual_plans("officeId")`;
    await sql`CREATE INDEX idx_annual_plans_task_id ON annual_plans("taskId")`;
    await sql`CREATE INDEX idx_annual_plans_year ON annual_plans(year)`;
    await sql`CREATE INDEX idx_annual_plans_status ON annual_plans(status)`;
    await sql`CREATE INDEX idx_notifications_user_id ON notifications("userId")`;
    await sql`CREATE INDEX idx_notifications_is_read ON notifications("isRead")`;
    console.log('✅ Indexes created');

    console.log('\n🎉 Database schema updated successfully!');
    console.log('\nNow you can run the migration script to transfer data from MongoDB to PostgreSQL.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema update failed:', error.message);
    process.exit(1);
  }
}

updateSchema();
