const mongoose = require('mongoose');
const { sql } = require('./db');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian-kpi-system';

async function migrate() {
  try {
    console.log('Starting data migration from MongoDB to PostgreSQL...');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import MongoDB models
    const User = require('./models/User');
    const Office = require('./models/Office');
    const Report = require('./models/Report');
    const AnnualPlan = require('./models/AnnualPlan');

    // Migrate Users
    console.log('\nMigrating users...');
    const users = await User.find({});
    for (const user of users) {
      await sql`
        INSERT INTO users (id, name, username, password, role, office, position_am, position_en, "accessibleOffices")
        VALUES (${user.id}, ${user.name}, ${user.username}, ${user.password}, ${user.role}, ${user.office}, ${user.position_am}, ${user.position_en}, ${JSON.stringify(user.accessibleOffices || [])})
        ON CONFLICT (username) DO UPDATE SET
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          office = EXCLUDED.office,
          position_am = EXCLUDED.position_am,
          position_en = EXCLUDED.position_en,
          "accessibleOffices" = EXCLUDED."accessibleOffices"
      `;
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate Offices
    console.log('\nMigrating offices...');
    const offices = await Office.find({});
    for (const office of offices) {
      await sql`
        INSERT INTO offices (office_id, name_am, name_en, icon, color, tasks)
        VALUES (${office.id}, ${office.name_am}, ${office.name_en}, ${office.icon}, ${office.color}, ${JSON.stringify(office.tasks)})
        ON CONFLICT (office_id) DO UPDATE SET
          name_am = EXCLUDED.name_am,
          name_en = EXCLUDED.name_en,
          icon = EXCLUDED.icon,
          color = EXCLUDED.color,
          tasks = EXCLUDED.tasks
      `;
    }
    console.log(`✅ Migrated ${offices.length} offices`);

    // Migrate Reports
    console.log('\nMigrating reports...');
    const reports = await Report.find({});
    for (const report of reports) {
      await sql`
        INSERT INTO reports ("officeId", "taskId", "kpiId", value, date, "userId")
        VALUES (${report.officeId}, ${report.taskId}, ${report.kpiId}, ${report.value}, ${report.date}, ${report.userId})
      `;
    }
    console.log(`✅ Migrated ${reports.length} reports`);

    // Migrate Annual Plans
    console.log('\nMigrating annual plans...');
    const annualPlans = await AnnualPlan.find({});
    for (const plan of annualPlans) {
      await sql`
        INSERT INTO annual_plans ("officeId", "taskId", "annualTargets", "distributedPlans", year, "submittedBy", "submittedAt", status, "approvedBy", "approvedAt", "rejectionReason")
        VALUES (${plan.officeId}, ${plan.taskId}, ${JSON.stringify(Object.fromEntries(plan.annualTargets))}, ${JSON.stringify(plan.distributedPlans ? {
          monthly: plan.distributedPlans.monthly ? Object.fromEntries(plan.distributedPlans.monthly) : null,
          weekly: plan.distributedPlans.weekly ? Object.fromEntries(plan.distributedPlans.weekly) : null,
          daily: plan.distributedPlans.daily ? Object.fromEntries(plan.distributedPlans.daily) : null
        } : null)}, ${plan.year}, ${plan.submittedBy}, ${plan.submittedAt}, ${plan.status}, ${plan.approvedBy}, ${plan.approvedAt}, ${plan.rejectionReason})
        ON CONFLICT ("officeId", "taskId", year) DO UPDATE SET
          "annualTargets" = EXCLUDED."annualTargets",
          "distributedPlans" = EXCLUDED."distributedPlans",
          status = EXCLUDED.status,
          "approvedBy" = EXCLUDED."approvedBy",
          "approvedAt" = EXCLUDED."approvedAt",
          "rejectionReason" = EXCLUDED."rejectionReason"
      `;
    }
    console.log(`✅ Migrated ${annualPlans.length} annual plans`);

    console.log('\n🎉 Data migration completed successfully!');
    
    // Close connections
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrate();
