const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Alternative: Manual CORS headers (if you don't want to use cors package)
/*
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
*/

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Firebase configuration
const FIREBASE_API_KEY = 'AIzaSyDo2AY5W66xkgXsaPbUN64zmbECzbz0gHU';
const FIREBASE_SIGNIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;

// Sign in endpoint
app.post('/signIn', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Validate token input
    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required',
        message: 'Please provide a token in the request body'
      });
    }

    // Make request to Firebase API
    const response = await fetch(FIREBASE_SIGNIN_URL, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'priority': 'u=1, i',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'x-browser-channel': 'stable',
        'x-browser-copyright': 'Copyright 2025 Google LLC. All rights reserved.',
        'x-browser-validation': 'DTaAFOAcbbd2xIkIWiLdbtAAhQc=',
        'x-browser-year': '2025',
        'x-client-data': 'CJO2yQEIprbJAQj2o8sBCIWgzQE=',
        'x-client-version': 'Chrome/JsCore/11.10.0/FirebaseCore-web'
      },
      body: JSON.stringify({
        token: token,
        returnSecureToken: true
      })
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: 'Firebase authentication failed',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Return successful response
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error in /signIn endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Sign in endpoint available at: http://localhost:${PORT}/signIn`);
  console.log('CORS enabled for cross-site requests');
});

module.exports = app;
