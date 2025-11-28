// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
// Import Buffer for Base64 encoding
const { Buffer } = require('node:buffer'); 

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_API_ROOT = 'http://54.255.172.156/GGVerseApi'; 

// 1. Define Authentication Credentials
const USERNAME = 'GGVerseApi';
const PASSWORD = 'pass@123@dmin';

// 2. Create the Base64 encoded string
const credentials = `${USERNAME}:${PASSWORD}`;
// Buffer.from(string).toString('base64') performs the encoding
const authEncoded = Buffer.from(credentials).toString('base64'); 

// 3. Construct the Authorization Header value
const AUTH_HEADER_VALUE = `Basic ${authEncoded}`;


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// The Proxy Endpoint
app.get('/api/*', async (req, res) => {
  try {
    const apiPath = req.params[0];
    const externalUrl = `${TARGET_API_ROOT}/${apiPath}`;

    // --- NEW: Define Headers with Basic Authentication ---
    const headers = {
      // Use the pre-calculated header value
      'Authorization': AUTH_HEADER_VALUE,
      // You may also want to explicitly set the content type
      'Accept': 'application/json' 
    };

    console.log(`Proxying request to: ${externalUrl}`);

    // Make the server-to-server call with the Authorization header
    const response = await axios.get(externalUrl, {
      params: req.query, 
      headers: headers   // <--- Headers are now included
    });

    res.json(response.data);

  } catch (error) {
    console.error('Proxy Error:', error.message);
    // Log the API's status code if available for better debugging
    const statusCode = error.response ? error.response.status : 500;
    console.error('API Response Status:', statusCode);
    res.status(statusCode).send(`Failed to fetch data. Status code: ${statusCode}`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Proxy Server is running at http://localhost:${PORT}`);
});