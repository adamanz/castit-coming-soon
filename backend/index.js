const express = require('express');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'titanium-vision-455301-c4'
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'https://castit.ai',
      'https://www.castit.ai',
      'http://localhost:3000',
      'https://castit-coming-soon-928327063539.us-central1.run.app'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log rejected origin for debugging
      console.log('CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'castit-email-backend' });
});

// Email submission endpoint
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Store in Firestore
    const docRef = firestore.collection('email_subscribers').doc(email);
    
    // Check if email already exists
    const doc = await docRef.get();
    if (doc.exists) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Save new subscriber
    await docRef.set({
      email,
      subscribedAt: new Date().toISOString(),
      source: 'landing_page',
      status: 'active'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Successfully subscribed!' 
    });

  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe. Please try again.' 
    });
  }
});

// Simple API key authentication middleware
const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.ADMIN_API_KEY || 'castit-admin-2025-secret-key';
  
  if (apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get subscriber count (protected by API key)
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await firestore.collection('email_subscribers')
      .where('status', '==', 'active')
      .get();
    
    res.json({
      totalSubscribers: snapshot.size,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// List all subscribers (protected by API key)
app.get('/api/admin/subscribers', authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await firestore.collection('email_subscribers').get();
    const subscribers = [];
    
    snapshot.forEach(doc => {
      subscribers.push({
        email: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      count: subscribers.length,
      subscribers: subscribers
    });
  } catch (error) {
    console.error('Error listing subscribers:', error);
    res.status(500).json({ error: 'Failed to list subscribers' });
  }
});

app.listen(PORT, () => {
  console.log(`Email backend running on port ${PORT}`);
});