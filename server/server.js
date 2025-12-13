const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

const app = express();

// --- ⚠️ CRITICAL: CONFIGURE CORS ORIGIN ⚠️ ---
// FIX APPLIED: Using the specific Vercel URL pattern provided in your last message.
// This is the domain the browser will report as the 'Origin'.
const VERCEL_FRONTEND_URL = 'https://leave-management-system-6nfzgz9vl-ajit-singhs-projects-af6c039f.vercel.app'; 

// Determine the allowed origin based on the environment
const ALLOWED_ORIGIN = process.env.NODE_ENV === 'production' 
    ? VERCEL_FRONTEND_URL 
    : 'http://localhost:3000'; // Development

// Middleware
app.use(cors({
    origin: ALLOWED_ORIGIN, // <--- This is the core fix for the "Network Failed" error
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Important for cookies/auth tokens used in login
}));

app.use(express.json());

// Basic sanity check for MONGO_URI
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing in environment variables");
    process.exit(1);
}

// Root route handler (Confirmed operational check)
app.get('/', (req, res) => {
    res.json({ 
        message: 'Leave Management System API is Operational!', 
        status: 'online',
        environment: process.env.NODE_ENV || 'development'
    });
});
// Health check (Render / load balancer friendly)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// Routes 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));


// Use PORT from environment (Render provides PORT automatically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful shutdown handlers
process.on('SIGINT', () => {
    console.log('SIGINT received — closing mongoose connection');
    mongoose.disconnect().then(() => process.exit(0));
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received — closing mongoose connection');
    mongoose.disconnect().then(() => process.exit(0));
});