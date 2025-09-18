const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const fraRoutes = require('./routes/fraRoutes');
const userRoutes = require('./routes/userRoutes');
const claimRoutes = require('./routes/claimRoutes');
const dssRoutes = require('./routes/dssRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', fraRoutes);
app.use('/api/users', userRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/dss', dssRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});