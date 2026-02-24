const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test PostgreSQL connection on startup
const { sql } = require('./db');

async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('PostgreSQL connected successfully!');
    return true;
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    return false;
  }
}

// Run connection test
testConnection();

// Routes
const authRoutes = require('./routes/auth');
const officeRoutes = require('./routes/offices');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const annualPlansRoutes = require('./routes/annualPlans');
const changePasswordRoutes = require('./routes/changePassword');

app.use('/api/auth', authRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/annual-plans', annualPlansRoutes);
app.use('/api/auth', changePasswordRoutes);

// Test endpoint for connectivity
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is reachable', database: 'PostgreSQL', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
