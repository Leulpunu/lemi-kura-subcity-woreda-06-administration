const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian-kpi-system')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const officeRoutes = require('./routes/offices');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const annualPlansRoutes = require('./routes/annualPlans');

app.use('/api/auth', authRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/annual-plans', annualPlansRoutes);

// Test endpoint for connectivity
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is reachable', timestamp: new Date().toISOString() });
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
