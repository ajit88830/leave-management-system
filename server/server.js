const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

const app = express();

// --- ⚠️ CRITICAL: CONFIGURE CORS ORIGIN ⚠️ ---
// FIX APPLIED: Allowing the specific, current Vercel URL AND localhost.
// If your Vercel URL changes again, you MUST update this list.
const ALLOWED_ORIGINS = [
    // Current Vercel URL from your last error log
    'https://leave-management-system-q3j4ox1mo-ajit-singhs-projects-af6c039f.vercel.app', 
    // Previous Vercel URL that might still be active
    'https://leave-management-system-tau-three.vercel.app',
    // The previous dynamic Vercel URL
    'https://leave-management-system-6nfzgz9vl-ajit-singhs-projects-af6c039f.vercel.app',
    // Localhost for development
    'http://localhost:3000', 
];

// Determine the final allowed origin setup
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl requests)
        // or requests from the allowed list
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // Even though you use localStorage, keeping credentials: true is best practice 
    // as it allows cookies to be sent if you ever switch methods.
    credentials: true, 
};

// Middleware
app.use(cors(corsOptions));

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