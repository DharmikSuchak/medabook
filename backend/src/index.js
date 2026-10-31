require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const slotRoutes = require('./routes/slots');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/slots', slotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SlotZero API', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SlotZero API running on port ${PORT}`);
});

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error('CRITICAL: MONGO_URI environment variable is not defined!');
} else {
  console.log('Connecting to MongoDB...');
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(async () => {
      console.log('Successfully connected to MongoDB');
      const { seedDoctors } = require('./utils/seedDoctors');
      await seedDoctors();
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
    });
}

module.exports = app;
