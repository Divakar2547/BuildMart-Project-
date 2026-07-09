const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.locals.dbConnected = false;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || origin.endsWith('.render.com') || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'BuildMart API is running',
    timestamp: new Date(),
    database: app.locals.dbConnected ? 'connected' : 'disconnected'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to MongoDB & Start Server
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmart';

const startServer = () => {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 BuildMart server running on port ${PORT} on ${HOST}`);
  });
};

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    app.locals.dbConnected = true;
    console.log('✅ MongoDB connected successfully');
    startServer();
  })
  .catch(err => {
    app.locals.dbConnected = false;
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Connection string used:', MONGODB_URI && MONGODB_URI.replace(/:.+@/, ':*****@'));
    startServer();
  });

module.exports = app;
