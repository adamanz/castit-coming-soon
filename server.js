const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://castit-coming-soon-*.run.app'] 
        : ['http://localhost:*'],
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting for signup endpoint
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many signup attempts, please try again later.'
});

// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// File-based storage for signups
const SIGNUPS_FILE = path.join(__dirname, 'signups.json');

async function saveSignup(email) {
    try {
        let signups = [];
        try {
            const data = await fs.readFile(SIGNUPS_FILE, 'utf8');
            signups = JSON.parse(data);
        } catch (err) {
            // File doesn't exist yet, start with empty array
        }
        
        // Check if email already exists
        if (signups.some(signup => signup.email === email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        signups.push({
            email,
            timestamp: new Date().toISOString()
        });
        
        await fs.writeFile(SIGNUPS_FILE, JSON.stringify(signups, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Error saving signup:', error);
        return { success: false, message: 'Failed to save signup' };
    }
}

// Send SMS notification via Sendblue
async function sendSMSNotification(email) {
    const phoneNumber = process.env.YOUR_PHONE_NUMBER;
    const sendblueDomain = process.env.SENDBLUE_DOMAIN || 'https://api.sendblue.co';
    
    if (!phoneNumber || !process.env.SENDBLUE_API_KEY || !process.env.SENDBLUE_API_SECRET) {
        console.log('SMS notification skipped - missing configuration');
        return;
    }
    
    try {
        const response = await axios.post(
            `${sendblueDomain}/api/send-message`,
            {
                number: phoneNumber,
                content: `🎉 New Castit signup!\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}\n\nTotal signups: Check signups.json`,
                send_style: 'invisible'
            },
            {
                headers: {
                    'sb-api-key-id': process.env.SENDBLUE_API_KEY,
                    'sb-api-secret-key': process.env.SENDBLUE_API_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('SMS notification sent successfully');
    } catch (error) {
        console.error('Error sending SMS:', error.response?.data || error.message);
    }
}

// Signup endpoint
app.post('/api/signup', signupLimiter, async (req, res) => {
    const { email } = req.body;
    
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide a valid email address' 
        });
    }
    
    const result = await saveSignup(email);
    
    if (result.success) {
        // Send SMS notification
        await sendSMSNotification(email);
        
        res.json({ 
            success: true, 
            message: 'Thanks! We\'ll notify you when Castit launches 🎉' 
        });
    } else {
        res.status(400).json(result);
    }
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});