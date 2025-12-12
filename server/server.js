// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

const app = express();

// Basic sanity checks
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in environment variables");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check (Render / load balancer friendly)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Connect to MongoDB (Mongoose 7+ no options required)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    // Exit so Render will mark deploy as failed — prevents a running service in bad state
    process.exit(1);
  });

// Routes (require existing route files)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));

// Use PORT from environment (Render provides PORT automatically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received — closing mongoose connection');
  mongoose.disconnect().then(() => process.exit(0));
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received — closing mongoose connection');
  mongoose.disconnect().then(() => process.exit(0));
});
