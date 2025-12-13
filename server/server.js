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

// --- PRODUCTION CORS CONFIGURATION ---
// IMPORTANT: Update this URL to your deployed React frontend URL.
// FIX APPLIED HERE: Replaced placeholder with the Vercel URL
const VERCEL_FRONTEND_URL = 'https://leave-management-system-frontend.vercel.app'; // <--- **REPLACE THIS WITH YOUR ACTUAL VERCEL DOMAIN**

const ALLOWED_ORIGIN = process.env.NODE_ENV === 'production' 
    ? VERCEL_FRONTEND_URL 
    : 'http://localhost:3000'; // Development

// Middleware
app.use(cors({
    origin: ALLOWED_ORIGIN, // <--- This now uses your Vercel URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

// --- FIX START: Add the missing root route handler ---
app.get('/', (req, res) => {
    // This is the response that stops the "Cannot GET /" message
    res.json({ 
        message: 'Leave Management System API is Operational!', 
        status: 'online',
        environment: process.env.NODE_ENV || 'development'
    });
});
// --- FIX END ---

// Health check (Render / load balancer friendly)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));


// Connect to MongoDB (Mongoose 7+ no options required)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        // Exit so Render will mark deploy as failed
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