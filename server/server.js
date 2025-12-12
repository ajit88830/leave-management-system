const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Debug: Check if environment variable is loaded
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Mongoose 7+ — NO OPTIONS REQUIRED)
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env file");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
