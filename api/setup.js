const { sql } = require('../backend/db');

async function createSchema() {
  // Create Users Table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      office VARCHAR(50),
      position_am VARCHAR(255),
      position_en VARCHAR(255),
      "accessibleOffices" JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Offices Table
  await sql`
    CREATE TABLE IF NOT EXISTS offices (
      office_id VARCHAR(50) PRIMARY KEY,
      name_am VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id VARCHAR(50),
      level INTEGER DEFAULT 1,
      target NUMERIC(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Reports Table
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      office_id VARCHAR(50) REFERENCES offices(office_id),
      task_id VARCHAR(50),
      value NUMERIC(10, 2) DEFAULT 0,
      date DATE,
      description TEXT,
      reported_by INTEGER REFERENCES users(id),
      report_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Annual Plans Table
  await sql`
    CREATE TABLE IF NOT EXISTS annual_plans (
      id SERIAL PRIMARY KEY,
      office_id VARCHAR(50) REFERENCES offices(office_id),
      task_id VARCHAR(50),
      annual_targets JSONB,
      distributed_plans JSONB,
      year INTEGER NOT NULL,
      submitted_by INTEGER REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'draft',
      approved_by INTEGER REFERENCES users(id),
      approved_at TIMESTAMP,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Notifications Table
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type VARCHAR(50) DEFAULT 'info',
      recipient VARCHAR(50),
      sender VARCHAR(255),
      office VARCHAR(50),
      is_read BOOLEAN DEFAULT FALSE,
      priority VARCHAR(20) DEFAULT 'medium',
      data JSONB,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_office_id ON reports(office_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_task_id ON reports(task_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_annual_plans_office_id ON annual_plans(office_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_annual_plans_year ON annual_plans(year)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_annual_plans_status ON annual_plans(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await createSchema();
    res.status(200).json({ message: 'Database schema created successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
